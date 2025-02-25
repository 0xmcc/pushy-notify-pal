import React, { useEffect, useState } from 'react';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { useRPS } from '@/providers/RPSProvider';
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { useRPSGameActions } from '@/modules/game/hooks/useRPSGameActions';
import bs58 from 'bs58';
import { CreatePlayerSection } from './CreatePlayerSection';
import { WalletSwitcher } from './WalletSwitcher';
import { GameStateDisplay } from './GameStateDisplay';
import { GameActionsSection } from './GameActionsSection';
import { MoveActionsSection } from './MoveActionsSection';
import { TransactionHistory } from './TransactionHistory';
import { getWalletPublicKey, checkWalletBalances } from '../utils';
import { WalletType } from '@/modules/game/types';
import { useRPSGameTransactions } from '@/modules/game/hooks/useRPSGameTransactions';
import { toast } from 'sonner';
import { useSolanaGameStateSync } from '@/modules/game/hooks/useSolanaGameStateSync';
const PROGRAM_ID = "AdNRN8coBzuAPKiKPz4uxEQrgDDp2ZxXjtXfu6NnYKSg";

export const RPSTestingInterface = () => {
  const { program } = useRPS();
  const { wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];
  const connection = new Connection(clusterApiUrl('devnet'));
  
  // Create player two from secret key
  const secretKey = "3K6ofDMmUZSCweZYdVgTkvVs5PPEJ6mB5dCC1cujLJHpFUo3ZEPoBg8wUPfs24G1Yix6TmWjaBs6r79T9fPFuBtb";
  let playerTwo: anchor.web3.Keypair;
  try {
    const secretKeyBuffer = bs58.decode(secretKey);
    playerTwo = anchor.web3.Keypair.fromSecretKey(secretKeyBuffer);
  } catch (error) {
    console.error('Error creating keypair:', error);
    throw error;
  }
  
  const [betAmount, setBetAmount] = useState('0.001');
  const [gamePublicKey, setGamePublicKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const [selectedMove, setSelectedMove] = useState<string>('0');
  const [moveCommitments, setMoveCommitments] = useState<{
    [gameKey: string]: {
      playerOne?: { move: string, salt: Uint8Array },
      playerTwo?: { move: string, salt: Uint8Array }
    }
  }>({});

  
  const [activeWallet, setActiveWallet] = useState<'real' | 'test'>('real');
  const [walletBalances, setWalletBalances] = useState<Record<string, number>>({});
  const [playerAccountsExist, setPlayerAccountsExist] = useState<{[key: string]: boolean}>({});

  const { 
    transactions, 
    handleCreatePlayer,
    handleJoinGame,
    handleCommitMove,
    handleRevealMove,
    handleClaimWinnings,
    handleCreateGame,
    handleCreateGameAndCommit,
    handleFetchGameState,
    handleJoinGameAndCommit
  } = useRPSGameActions();

  const { waitForTransactionConfirmation } = useRPSGameTransactions();

  // Get current wallet helper
  const getCurrentWallet = (): WalletType | null => {
    if (activeWallet === 'test') {
      return {
        type: 'test' as const,
        publicKey: playerTwo.publicKey,
        keypair: playerTwo
      };
    } else if (solanaWallet) {
      return {
        type: 'real' as const,
        address: solanaWallet.address
      };
    }
    return null;
  };

  // Check player account helper
  const checkPlayerAccount = async (wallet: WalletType | null) => {
    if (!program || !wallet) return false;
    try {
      const pubkey = getWalletPublicKey(wallet);
      const [playerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("player"), pubkey.toBuffer()],
        program.programId
      );
      
      const account = await program.account.player.fetch(playerPda);
      return !!account;
    } catch (error) {
      return false;
    }
  };

  // Update player accounts effect
  useEffect(() => {
    const checkAccounts = async () => {
      if (!program) return;
      
      const testWallet = { type: 'test' as const, publicKey: playerTwo.publicKey, keypair: playerTwo };
      const realWallet = solanaWallet ? { type: 'real' as const, address: solanaWallet.address } : null;
      
      const testExists = await checkPlayerAccount(testWallet);
      const realExists = await checkPlayerAccount(realWallet);
      
      setPlayerAccountsExist(prev => {
        if (prev.test === testExists && prev.real === realExists) {
          return prev;
        }
        return {
          test: testExists,
          real: realExists
        };
      });
    };
    
    const timeoutId = setTimeout(checkAccounts, 1000);
    return () => clearTimeout(timeoutId);
  }, [program?.programId.toString(), solanaWallet?.address, playerTwo.publicKey.toString()]);

  useEffect(() => {
    const updateBalances = async () => {
      if (!connection) return;
      
      const testWallet = { type: 'test' as const, publicKey: playerTwo.publicKey, keypair: playerTwo };
      const realWallet = solanaWallet ? { type: 'real' as const, address: solanaWallet.address } : null;
      
      const balances = await checkWalletBalances(connection, testWallet, realWallet);
      
      setWalletBalances(prev => {
        if (prev.test === balances.test && prev.real === balances.real) {
          return prev;
        }
        return balances;
      });
    };

    updateBalances();
    const interval = setInterval(updateBalances, 10000);
    return () => clearInterval(interval);
  }, [connection, playerTwo.publicKey.toString(), solanaWallet?.address]);

  const onClaimWinnings = async () => {
    const currentWallet = getCurrentWallet();
    if (!currentWallet) return;
    
    return handleClaimWinnings(
      getWalletPublicKey(currentWallet),
      gamePublicKey,
      gameState,
      currentWallet.type === 'test' ? currentWallet.keypair : undefined
    );
  };

  const onCommitMove = async () => {
    const currentWallet = getCurrentWallet();
    if (!currentWallet || !gamePublicKey) {
      toast.error('Missing wallet or game public key');
      return;
    }

    const result = await handleCommitMove(
      currentWallet,
      gamePublicKey,
      selectedMove
    );

    if (!result) {
      toast.error('Failed to commit move');
      return;
    }
    
    setGameState(result.gameAccount);
    // Determine if current wallet is player one or two
    const isPlayerOne = result.gameAccount.playerOne.toBase58() === result.walletPubkey.toBase58();
    // Store the move and salt for the appropriate player
    setMoveCommitments(prev => ({
      ...prev,
      [gamePublicKey]: {
        ...prev[gamePublicKey],
        [isPlayerOne ? 'playerOne' : 'playerTwo']: { move: result.moveNumber, salt: result.salt }
      }
    }));
  };


  const onCreateGame = async () => {
    const currentWallet = getCurrentWallet();
    if (!currentWallet) return;

    const result = await handleCreateGame(currentWallet, betAmount);
    if (result) {
      const confirmation = await waitForTransactionConfirmation(program, result.tx, result.gamePda);
      setGameState(confirmation.gameAccount);
      setGamePublicKey(result.gamePda.toString());
    }
  };



  const onJoinGame = async () => {
    const currentWallet = getCurrentWallet();
    if (!currentWallet || !gamePublicKey) return;

    const result = await handleJoinGame(currentWallet, gamePublicKey);
    if (result) {
      setGameState(result.gameAccount);
    }
  };

  const onJoinGameAndCommit = async () => {
    const currentWallet = getCurrentWallet();
    if (!currentWallet || !gamePublicKey) return;

    const result = await handleJoinGameAndCommit(currentWallet, gamePublicKey, selectedMove);
    if (result) {
      setGameState(result.gameAccount);
      setMoveCommitments(prev => ({
        ...prev,
        [gamePublicKey]: {
          playerTwo: { 
            move: result.moveNumber, 
            salt: result.salt 
          }
        }
      }));
    }
  };

  const onFetchGameState = async () => {
    console.log('Fetching game state:', gamePublicKey);
    const currentWallet = getCurrentWallet();
    if (!currentWallet || !gamePublicKey) return;
    const result = await handleFetchGameState(gamePublicKey);
    console.log('Game state:', result);
    setGameState(result);
  };

  const onCreateGameAndCommit = async () => {
    const currentWallet = getCurrentWallet();
    if (!currentWallet) return;

    const result = await handleCreateGameAndCommit(
      currentWallet,
      betAmount,
      selectedMove
    );

    if (result) {
      setGamePublicKey(result.gamePda.toString());
      setGameState(result.gameAccount);
      setMoveCommitments(prev => ({
        ...prev,
        [result.gamePda.toString()]: {
          playerOne: { 
            move: result.moveNumber, 
            salt: result.salt 
          }
        }
      }));
    }
  };

  const onCreatePlayer = async () => {
    const currentWallet = getCurrentWallet();
    if (!currentWallet) return;
    await handleCreatePlayer(currentWallet);
  };

  const onRevealMove = async () => {
    const currentWallet = getCurrentWallet();
    if (!currentWallet || !gamePublicKey) return;
    
    const commitment = moveCommitments[gamePublicKey];
    const playerType = gameState.playerOne.toString() === getWalletPublicKey(currentWallet).toString() 
      ? 'playerOne' 
      : 'playerTwo';
    
    if (!commitment || !commitment[playerType]) {
      throw new Error('No move commitment found');
    }

    const result = await handleRevealMove(
      currentWallet,
      gamePublicKey,
      parseInt(commitment[playerType].move),
      commitment[playerType].salt
    );
    console.log('Reveal move result:', result);
    if (result) {
      console.log('New game state:', result.gameAccount);
      setGameState(result.gameAccount);
    }
  };

  // const onJoinGameAndCommit = async () => {
  //   const currentWallet = getCurrentWallet();
  //   if (!currentWallet || !gamePublicKey) {
  //     toast.error('Missing wallet or game public key');
  //     return;
  //   }

  //   const result = await handleJoinGameAndCommit(
  //     currentWallet,
  //     gamePublicKey,
  //     selectedMove
  //   );

  //   if (result) {
  //     setGameState(result.gameAccount);
  //     setMoveCommitments(prev => ({
  //       ...prev,
  //       [gamePublicKey]: {
  //         playerTwo: { 
  //           move: result.moveNumber, 
  //           salt: result.salt 
  //         }
  //       }
  //     }));
  //   }
  // };

  return (
    <div className="space-y-8 p-6 bg-gray-800 rounded-lg">
      <div>
        <h3 className="text-2xl font-semibold mb-2">Rock Paper Scissors Testing Interface</h3>
        <p className="text-gray-400 mb-6">Follow these steps to test the Rock Paper Scissors game on Solana</p>
        
        <WalletSwitcher 
          activeWallet={activeWallet}
          setActiveWallet={setActiveWallet}
          walletBalances={walletBalances}
          playerAccountsExist={playerAccountsExist}
          solanaWallet={solanaWallet}
          playerTwo={playerTwo}
        />
        
        <div className="space-y-8">
          <CreatePlayerSection 
            handleCreatePlayer={onCreatePlayer}
            isLoading={isLoading}
            program={program}
            activeWallet={activeWallet}
          />

          <GameActionsSection 
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            handleCreateGame={onCreateGame}
            handleCreateGameAndCommit={onCreateGameAndCommit}
            handleJoinGame={onJoinGame}
            handleJoinGameAndCommit={onJoinGameAndCommit}
            handleFetchGameState={onFetchGameState}
            gamePublicKey={gamePublicKey}
            setGamePublicKey={setGamePublicKey}
            isLoading={isLoading}
            program={program}
            selectedMove={selectedMove}
            activeWallet={activeWallet}
          />

          <MoveActionsSection 
            selectedMove={selectedMove}
            setSelectedMove={setSelectedMove}
            handleCommitMove={onCommitMove}
            handleRevealMove={onRevealMove}
            isLoading={isLoading}
            program={program}
            gamePublicKey={gamePublicKey}
            activeWallet={activeWallet}
          />

          {gameState && (
            <GameStateDisplay 
              gameState={gameState}
              gamePublicKey={gamePublicKey}
              handleClaimWinnings={onClaimWinnings}
              handleFetchGameState={onFetchGameState}
              isLoading={isLoading}
              program={program}
            />
          )}

          <TransactionHistory transactions={transactions} />
        </div>
      </div>
    </div>
  );
}; 