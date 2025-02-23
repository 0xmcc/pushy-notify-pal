import React, { useEffect, useState } from 'react';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { RPSProvider, useRPS } from '@/providers/RPSProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, Keypair, LAMPORTS_PER_SOL, Connection, clusterApiUrl } from '@solana/web3.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as anchor from '@coral-xyz/anchor';

const PROGRAM_ID = "AdNRN8coBzuAPKiKPz4uxEQrgDDp2ZxXjtXfu6NnYKSg";

type WalletType = {
  publicKey: PublicKey;
} | {
  address: string;
};

// Create two test wallets
const TEST_WALLET_1 = { publicKey: Keypair.generate().publicKey };
const TEST_WALLET_2 = { publicKey: Keypair.generate().publicKey };

type TransactionInfo = {
  type: 'create_game' | 'join_game' | 'commit_move' | 'reveal_move';
  signature: string;
  timestamp: number;
  gameAccount?: string;
};

const RPSTestingInterface = () => {
  const { program, createGameAndCommitMove } = useRPS();
  const { wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];
  const connection = new Connection(clusterApiUrl('devnet'));
  
  const [betAmount, setBetAmount] = useState('0.1');
  const [gamePublicKey, setGamePublicKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const [selectedMove, setSelectedMove] = useState<string>('0'); // Default to Rock
  const [salt] = useState(() => crypto.getRandomValues(new Uint8Array(32)));
  const [activeWallet, setActiveWallet] = useState<'real' | 'test1' | 'test2'>('real');
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  
  // Get the current wallet based on selection
  const getCurrentWallet = (): WalletType | null => {
    switch (activeWallet) {
      case 'test1':
        return TEST_WALLET_1;
      case 'test2':
        return TEST_WALLET_2;
      default:
        return solanaWallet || null;
    }
  };

  // Get wallet display name
  const getWalletDisplayName = (type: 'real' | 'test1' | 'test2') => {
    switch (type) {
      case 'test1':
        return 'Test Wallet 1';
      case 'test2':
        return 'Test Wallet 2';
      default:
        return 'Your Wallet';
    }
  };

  // Get shortened address for display
  const getShortAddress = (wallet: WalletType | null) => {
    if (!wallet) return 'Not Connected';
    if ('publicKey' in wallet) {
      return `${wallet.publicKey.toBase58().slice(0, 4)}...${wallet.publicKey.toBase58().slice(-4)}`;
    }
    return `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`;
  };

  // Get wallet public key
  const getWalletPublicKey = (wallet: WalletType | null): PublicKey => {
    if (!wallet) throw new Error('No wallet connected');
    if ('publicKey' in wallet) {
      return wallet.publicKey;
    }
    return new PublicKey(wallet.address);
  };

  // Helper function to add transaction to history
  const addTransaction = (info: TransactionInfo) => {
    setTransactions(prev => [info, ...prev]);
  };

  // Helper function to get explorer URL
  const getExplorerUrl = (type: 'tx' | 'address', value: string) => {
    return `https://explorer.solana.com/${type}/${value}?cluster=devnet`;
  };

  const handleCreatePlayer = async () => {
    const currentWallet = getCurrentWallet();
    if (!program || !currentWallet) return;
    setIsLoading(true);
    try {
      const walletPubkey = getWalletPublicKey(currentWallet);
      // Derive the player account PDA
      const [playerAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("player"), walletPubkey.toBuffer()],
        new PublicKey(PROGRAM_ID)
      );
      
      // Derive the player's vault PDA
      const [vault] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), playerAccount.toBuffer()],
        new PublicKey(PROGRAM_ID)
      );

      const tx = await program.methods.createPlayer()
        .accounts({
          user: walletPubkey,
          playerAccount,
          vault,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      toast.success('Player created successfully!');
      console.log('Create player transaction:', tx);
    } catch (error) {
      console.error('Error creating player:', error);
      toast.error('Failed to create player');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchGameState = async (pubkey?: string) => {
    if (!program || (!gamePublicKey && !pubkey)) return;
    try {
      // Wait for account to be available
      const targetPubkey = new PublicKey(pubkey || gamePublicKey);
      
      // Try multiple times with longer delays
      let gameAccount = null;
      for (let i = 0; i < 5; i++) {
        try {
          gameAccount = await program.account.game.fetch(targetPubkey);
          break;
        } catch (e) {
          if (i < 4) {
            console.log(`Waiting for game account to be available... Attempt ${i + 1}/5`);
            // Exponential backoff: 2s, 4s, 8s, 16s
            await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, i)));
          } else {
            throw e;
          }
        }
      }
      
      if (gameAccount) {
        setGameState(gameAccount);
        console.log('Game state:', gameAccount);
        toast.success('Game state fetched successfully');
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
      toast.error('Failed to fetch game state - please check Solana Explorer');
      
      // Log explorer links for debugging
      console.log('Check transaction on Solana Explorer:');
      console.log(`https://explorer.solana.com/address/${pubkey || gamePublicKey}?cluster=devnet`);
    }
  };

  // Helper function to wait for transaction confirmation and return game data
  const waitForTransactionConfirmation = async (
    signature: string,
    gamePda: PublicKey
  ): Promise<{ confirmed: boolean; gameAccount: any | null }> => {
    let timeoutCount = 0;
    const maxTimeout = 30; // 30 seconds timeout
    
    while (timeoutCount < maxTimeout) {
      const status = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      
      if (status) {
        // Check confirmation status with proper type handling
        if (status.meta?.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(status.meta.err)}`);
        }
        
        // Get confirmation status from blockTime or slot being set
        if (status.blockTime && status.slot) {
          // Try to fetch the game account
          try {
            const gameAccount = await program?.account.game.fetch(gamePda);
            return { confirmed: true, gameAccount };
          } catch (e) {
            console.log('Game account not yet available, retrying...');
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      timeoutCount++;
    }
    
    throw new Error('Transaction confirmation timeout');
  };

  // Helper function to create move commitment
  const createCommitment = async (move: number, salt: Uint8Array): Promise<Uint8Array> => {
    // Convert move to bytes first
    const moveBytes = new Uint8Array([move]);

    // Combine move bytes with salt
    const combinedArray = new Uint8Array(moveBytes.length + salt.length);
    combinedArray.set(moveBytes);
    combinedArray.set(salt, moveBytes.length);

    // Create SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', combinedArray);
    return new Uint8Array(hashBuffer);
  };

  const handleCreateGame = async () => {
    const currentWallet = getCurrentWallet();
    if (!program || !currentWallet) return null;
    setIsLoading(true);
    
    try {
      const walletPubkey = getWalletPublicKey(currentWallet);
      
      // Check wallet balance first
      const balance = await connection.getBalance(walletPubkey);
      console.log('Current wallet balance:', balance / LAMPORTS_PER_SOL, 'SOL');
      
      const requiredBalance = parseFloat(betAmount) + 0.01; // bet amount + buffer for fees
      if (balance < LAMPORTS_PER_SOL * requiredBalance) {
        throw new Error(`Insufficient balance. Need at least ${requiredBalance} SOL`);
      }

      // Create timestamp for PDA derivation
      const creationTimestamp = new BN(new Date().getTime());

      // Derive PDAs
      const [gamePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("game"),
          walletPubkey.toBuffer(),
          creationTimestamp.toArrayLike(Buffer, 'le', 8),
        ],
        program.programId
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), gamePda.toBuffer()],
        program.programId
      );

      const betAmountLamports = new BN(parseFloat(betAmount) * LAMPORTS_PER_SOL);

      // Send transaction
      const tx = await program.methods
        .createGame(creationTimestamp, betAmountLamports)
        .accounts({
          playerOne: walletPubkey,
          gameAccount: gamePda,
          gameVault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log('Create game transaction:', tx);
      addTransaction({
        type: 'create_game',
        signature: tx,
        timestamp: Date.now(),
        gameAccount: gamePda.toString()
      });
      
      // Wait for transaction to be finalized and get game data
      console.log('Waiting for transaction confirmation...');
      const { confirmed, gameAccount } = await waitForTransactionConfirmation(tx, gamePda);
      
      if (confirmed && gameAccount) {
        setGamePublicKey(gamePda.toString());
        setGameState(gameAccount);
        toast.success('Game created successfully!');
        console.log('Game account:', gamePda.toString());
        console.log('Initial game state:', gameAccount);
        return gamePda;
      }
      return null;
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create game');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    const currentWallet = getCurrentWallet();
    if (!program || !gamePublicKey || !currentWallet) return;
    setIsLoading(true);
    try {
      const walletPubkey = getWalletPublicKey(currentWallet);
      const tx = await program.methods.joinGame()
      .accounts({
        playerTwo: walletPubkey,
        gameAccount: new PublicKey(gamePublicKey),
        systemProgram: SystemProgram.programId,
      })
      .rpc();
      
      toast.success('Joined game successfully!');
      console.log('Join game transaction:', tx);
      addTransaction({
        type: 'join_game',
        signature: tx,
        timestamp: Date.now(),
        gameAccount: gamePublicKey
      });
      await handleFetchGameState();
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommitMove = async (gamePda?: PublicKey) => {
    const currentWallet = getCurrentWallet();
    const targetGamePda = gamePda || (gamePublicKey ? new PublicKey(gamePublicKey) : null);
    if (!program || !targetGamePda || !currentWallet || !selectedMove) return;
    setIsLoading(true);
    try {
      const walletPubkey = getWalletPublicKey(currentWallet);
      
      // Create commitment using the helper function
      const moveNumber = parseInt(selectedMove);
      const commitment = await createCommitment(moveNumber, salt);
      
      // Get game account for vault PDA
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), targetGamePda.toBuffer()],
        program.programId
      );

      const tx = await program.methods.commitMove(
        Array.from(commitment)
      )
      .accounts({
        player: walletPubkey,
        game: targetGamePda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
      
      // Wait for transaction confirmation and get updated game state
      console.log('Commit move transaction:', tx);
      addTransaction({
        type: 'commit_move',
        signature: tx,
        timestamp: Date.now(),
        gameAccount: targetGamePda.toString()
      });
      const { confirmed, gameAccount } = await waitForTransactionConfirmation(tx, targetGamePda);
      
      if (confirmed && gameAccount) {
        setGameState(gameAccount);
        toast.success('Move committed successfully!');
        console.log('Updated game state:', gameAccount);
      }
    } catch (error) {
      console.error('Error committing move:', error);
      toast.error('Failed to commit move');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevealMove = async () => {
    const currentWallet = getCurrentWallet();
    if (!program || !gamePublicKey || !currentWallet || !selectedMove) return;
    setIsLoading(true);
    try {
      const walletPubkey = getWalletPublicKey(currentWallet);
      const tx = await program.methods.revealMove(
        parseInt(selectedMove),
        Array.from(salt)
      )
      .accounts({
        player: walletPubkey,
        opponent: gameState.playerTwo || gameState.playerOne,
        game: new PublicKey(gamePublicKey),
        gameVault: gameState.vault,
        playerVault: SystemProgram.programId, // This needs to be the correct vault PDA
        opponentVault: SystemProgram.programId, // This needs to be the correct vault PDA
        systemProgram: SystemProgram.programId,
      })
      .rpc();
      
      toast.success('Move revealed successfully!');
      console.log('Reveal move transaction:', tx);
      addTransaction({
        type: 'reveal_move',
        signature: tx,
        timestamp: Date.now(),
        gameAccount: gamePublicKey
      });
      await handleFetchGameState();
    } catch (error) {
      console.error('Error revealing move:', error);
      toast.error('Failed to reveal move');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGameAndCommit = async () => {
    if (!program || !selectedMove) return;
    setIsLoading(true);
    
    try {
      // First create the game and get the PDA
      const gamePda = await handleCreateGame();
      if (!gamePda) {
        throw new Error('Failed to create game');
      }
      
      // Then commit the move using the PDA directly
      await handleCommitMove(gamePda);
      
      toast.success('Game created and move committed successfully!');
    } catch (error) {
      console.error('Error in create and commit:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create game and commit move');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gray-800 rounded-lg">
      <div>
        <h3 className="text-2xl font-semibold mb-2">Rock Paper Scissors Testing Interface</h3>
        <p className="text-gray-400 mb-6">Follow these steps to test the Rock Paper Scissors game on Solana</p>
        
        {/* Wallet Switcher */}
        <div className="border border-gray-700 rounded-lg p-4 mb-8">
          <h4 className="text-lg font-semibold mb-4">Active Wallet</h4>
          <div className="grid grid-cols-3 gap-4">
            {(['real', 'test1', 'test2'] as const).map((wallet) => (
              <div 
                key={wallet}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${activeWallet === wallet 
                    ? 'border-gaming-accent bg-gray-700' 
                    : 'border-gray-600 hover:border-gray-500'}`}
                onClick={() => setActiveWallet(wallet)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{getWalletDisplayName(wallet)}</span>
                  {activeWallet === wallet && (
                    <span className="px-2 py-1 text-xs bg-gaming-accent rounded-full">Active</span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {wallet === 'real' 
                    ? getShortAddress(solanaWallet)
                    : getShortAddress(wallet === 'test1' ? TEST_WALLET_1 : TEST_WALLET_2)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-8">
          {/* Step 1: Create Player */}
          <div className="border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold">Step 1: Create Player Account</h4>
              <span className="text-sm text-gray-400">
                Using: {getWalletDisplayName(activeWallet)}
              </span>
            </div>
            <p className="text-gray-400 mb-4">First, create your player account on the blockchain. This only needs to be done once.</p>
            <Button 
              onClick={handleCreatePlayer}
              disabled={isLoading || !program}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Create Player Account
            </Button>
          </div>

          {/* Step 2: Create or Join Game */}
          <div className="border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold">Step 2: Create or Join a Game</h4>
              <span className="text-sm text-gray-400">
                Using: {getWalletDisplayName(activeWallet)}
              </span>
            </div>
            <div className="space-y-4">
              {/* Create Game Section */}
              <div>
                <p className="text-gray-400 mb-2">Create a new game by setting a bet amount:</p>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Bet amount in SOL"
                    className="w-full bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-gaming-accent focus:border-gaming-accent"
                  />
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleCreateGame}
                      disabled={isLoading || !program}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Create Game Only
                    </Button>
                    <Button 
                      onClick={handleCreateGameAndCommit}
                      disabled={isLoading || !program || !selectedMove}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      Create & Commit Move
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">OR</span>
                </div>
              </div>

              {/* Join Game Section */}
              <div>
                <p className="text-gray-400 mb-2">Join an existing game by entering its public key:</p>
                <div className="space-y-2">
                  <Input
                    value={gamePublicKey}
                    onChange={(e) => setGamePublicKey(e.target.value)}
                    placeholder="Paste Game Public Key"
                    className="w-full bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-gaming-accent focus:border-gaming-accent"
                  />
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleJoinGame}
                      disabled={isLoading || !program || !gamePublicKey}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Join Game
                    </Button>
                    <Button 
                      onClick={() => handleFetchGameState()}
                      disabled={!program || !gamePublicKey}
                      className="flex-1"
                    >
                      Check Game Status
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Play Your Move */}
          <div className="border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold">Step 3: Make Your Move</h4>
              <span className="text-sm text-gray-400">
                Using: {getWalletDisplayName(activeWallet)}
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              The game uses a commit-reveal scheme for fairness:
              <br/>1. First, commit your move (it will be encrypted)
              <br/>2. After both players commit, reveal your move
            </p>
            <div className="space-y-4">
              <Select onValueChange={setSelectedMove} value={selectedMove}>
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white focus:ring-gaming-accent focus:border-gaming-accent">
                  <SelectValue placeholder="Choose: Rock, Paper, or Scissors" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-white">
                  <SelectItem value="0" className="focus:bg-gray-600 focus:text-white">Rock</SelectItem>
                  <SelectItem value="1" className="focus:bg-gray-600 focus:text-white">Paper</SelectItem>
                  <SelectItem value="2" className="focus:bg-gray-600 focus:text-white">Scissors</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleCommitMove()}
                  disabled={isLoading || !program || !gamePublicKey || !selectedMove}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                >
                  1. Commit Move
                </Button>
                <Button 
                  onClick={handleRevealMove}
                  disabled={isLoading || !program || !gamePublicKey || !selectedMove}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  2. Reveal Move
                </Button>
              </div>
            </div>
          </div>

          {/* Game State Display */}
          {gameState && (
            <div className="mt-6 p-4 border border-gray-700 rounded-lg">
              <h4 className="text-xl font-semibold mb-4">Current Game Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                  <span>Game Account:</span>
                  <a 
                    href={getExplorerUrl('address', gamePublicKey)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {gamePublicKey.slice(0, 4)}...{gamePublicKey.slice(-4)}
                  </a>
                </div>
                <div className="flex justify-between p-2 bg-gray-700 rounded">
                  <span>Game State:</span>
                  <span className="font-medium">{gameState.state.active ? 'Active' : 'Finished'}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-700 rounded">
                  <span>Bet Amount:</span>
                  <span className="font-medium">{(Number(gameState.betAmount) / LAMPORTS_PER_SOL).toFixed(2)} SOL</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-700 rounded">
                  <span>Player One:</span>
                  <a 
                    href={getExplorerUrl('address', gameState.playerOne.toString())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {gameState.playerOne.toString().slice(0, 4)}...{gameState.playerOne.toString().slice(-4)}
                  </a>
                </div>
                {gameState.playerTwo && (
                  <div className="flex justify-between p-2 bg-gray-700 rounded">
                    <span>Player Two:</span>
                    <a 
                      href={getExplorerUrl('address', gameState.playerTwo.toString())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {gameState.playerTwo.toString().slice(0, 4)}...{gameState.playerTwo.toString().slice(-4)}
                    </a>
                  </div>
                )}
                <div className="flex justify-between p-2 bg-gray-700 rounded">
                  <span>Move Status:</span>
                  <span className="font-medium">
                    {gameState.playerOneMoveCommitted ? 'Player 1 Committed' : 'Waiting for Player 1'} |{' '}
                    {gameState.playerTwoMoveCommitted ? 'Player 2 Committed' : 'Waiting for Player 2'}
                  </span>
                </div>
                {gameState.winner && (
                  <div className="flex justify-between p-2 bg-gray-700 rounded">
                    <span>Winner:</span>
                    <a 
                      href={getExplorerUrl('address', gameState.winner.toString())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {gameState.winner.toString().slice(0, 4)}...{gameState.winner.toString().slice(-4)}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transaction History */}
          <div className="mt-6 p-4 border border-gray-700 rounded-lg">
            <h4 className="text-xl font-semibold mb-4">Transaction History</h4>
            <div className="space-y-2">
              {transactions.map((tx, index) => (
                <div key={index} className="p-2 bg-gray-700 rounded">
                  <div className="flex justify-between items-center">
                    <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                    <a 
                      href={getExplorerUrl('tx', tx.signature)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {tx.signature.slice(0, 4)}...{tx.signature.slice(-4)}
                    </a>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-gray-400 text-center p-4">
                  No transactions yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OnChainGamesPage = () => {
  const { program, isLoading, error } = useRPS();
  const { wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];
  
  useEffect(() => {
    console.log("[OnChainGamesPage] State changed:", {
      programExists: !!program,
      programDetails: program,
      isLoading,
      walletConnected: !!solanaWallet?.address,
    });
  }, [program, isLoading, solanaWallet?.address]);

  console.log("[OnChainGamesPage] Rendering");
//  const contextValue = React.useContext(RPSContext);
//  console.log("[OnChainGamesPage] Context value:", !!contextValue);
  try {
    const rps = useRPS();
    console.log("[OnChainGamesPage] RPS context:", !!rps);
  } catch (e) {
    console.log("[OnChainGamesPage] Error accessing context:", e);
  }

  if (isLoading) {
    return <div>Loading RPS program...</div>;
  }

  // if (!program) {
  //   return <div>Program not initialized</div>;
  // }

  // if (error) {
  //   return <div>Error2: {error.message}</div>;
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gaming-text mb-6">On-Chain Games</h1>
      
      {/* Status Indicators */}
      <div className="mb-8 space-y-4">
        <div className="p-4 rounded-lg bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">RPS Provider Status</h2>
          
          <div className="space-y-2">
            {/* Wallet Status */}
            <div className="flex items-center">
              <span className="mr-2">Wallet Status:</span>
              <span className={`px-2 py-1 rounded ${solanaWallet?.address ? 'bg-green-600' : 'bg-red-600'}`}>
                {solanaWallet?.address ? 'Connected' : 'Not Connected'}
              </span>
              {solanaWallet?.address && (
                <span className="ml-2 text-sm text-gray-400">
                  {`${solanaWallet.address.slice(0, 4)}...${solanaWallet.address.slice(-4)}`}
                </span>
              )}
            </div>

            {/* Program Status */}
            <div className="flex items-center">
              <span className="mr-2">Program Status:</span>
              <span className={`px-2 py-1 rounded ${program ? 'bg-green-600' : 'bg-red-600'}`}>
                {program ? 'Initialized' : 'Not Initialized'}
              </span>
              {program && (
                <span className="ml-2 text-sm text-gray-400">
                  {`${program.programId.toString()}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Testing Interface */}
      <RPSTestingInterface />
    </div>
  );
};

export default OnChainGamesPage; 
