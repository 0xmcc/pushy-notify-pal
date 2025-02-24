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
import { useRPSGameActions } from '@/modules/game/hooks/useRPSGameActions';
import bs58 from 'bs58';

const PROGRAM_ID = "AdNRN8coBzuAPKiKPz4uxEQrgDDp2ZxXjtXfu6NnYKSg";

type WalletType = {
  type: 'test';
  publicKey: PublicKey;
  keypair: Keypair;
} | {
  type: 'real';
  address: string;
};

const secretKey = '3K6ofDMmUZSCweZYdVgTkvVs5PPEJ6mB5dCC1cujLJHpFUo3ZEPoBg8wUPfs24G1Yix6TmWjaBs6r79T9fPFuBtb';

// Create player two (for testing) from a known secret key
//const playerTwo = anchor.web3.Keypair.fromSecretKey(Buffer.from(secretKey, "hex"));

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
  
  // Create player two (for testing) from a known secret key
  const secretKey = "3K6ofDMmUZSCweZYdVgTkvVs5PPEJ6mB5dCC1cujLJHpFUo3ZEPoBg8wUPfs24G1Yix6TmWjaBs6r79T9fPFuBtb";
  console.log('Secret key length:', secretKey.length);
  console.log('Secret key:', secretKey);

  let playerTwo: anchor.web3.Keypair;
  try {
    const secretKeyBuffer = bs58.decode(secretKey);
    console.log('Secret key buffer length:', secretKeyBuffer.length);
    console.log('Secret key buffer:', secretKeyBuffer);
    playerTwo = anchor.web3.Keypair.fromSecretKey(secretKeyBuffer);
    console.log('Test wallet public key:', playerTwo.publicKey.toBase58());
  } catch (error) {
    console.error('Error creating keypair:', error);
    throw error;
  }
  
  const [betAmount, setBetAmount] = useState('0.01');
  const [gamePublicKey, setGamePublicKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const [selectedMove, setSelectedMove] = useState<string>('0'); // Default to Rock
  const [salt] = useState(() => crypto.getRandomValues(new Uint8Array(32)));
  const [activeWallet, setActiveWallet] = useState<'real' | 'test'>('real');
  const { createGame, commitMove, transactions, createPlayer, joinGame, revealMove } = useRPSGameActions();
  const [walletBalances, setWalletBalances] = useState<Record<string, number>>({});
  const [playerAccountsExist, setPlayerAccountsExist] = useState<{[key: string]: boolean}>({});

  // Update getCurrentWallet to be more explicit about wallet selection
  const getCurrentWallet = (): WalletType | null => {
    if (activeWallet === 'test') {
      return {
        type: 'test',
        publicKey: playerTwo.publicKey,
        keypair: playerTwo
      };
    } else if (solanaWallet) {
      return {
        type: 'real',
        address: solanaWallet.address
      };
    }
    return null;
  };

  // Get wallet display name
  const getWalletDisplayName = (type: 'real' | 'test') => {
    switch (type) {
      case 'test':
        return 'Test Wallet';
      default:
        return 'Your Wallet';
    }
  };

  // Update getShortAddress function to handle wallet types correctly
  const getShortAddress = (wallet: WalletType | null) => {
    if (!wallet) return 'Not Connected';
    const address = wallet.type === 'test' ? 
      wallet.publicKey.toBase58() : 
      wallet.address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Get wallet public key
  const getWalletPublicKey = (wallet: WalletType): PublicKey => {
    if (wallet.type === 'test') {
      return wallet.publicKey;
    }
    return new PublicKey(wallet.address);
  };

  // Helper function to get the keypair for signing
  const getWalletSigner = (wallet: WalletType): Keypair | undefined => {
    if (wallet.type === 'test') {
      return wallet.keypair;
    }
    return undefined;
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
      const signer = getWalletSigner(currentWallet);
      
      const tx = await createPlayer(walletPubkey, signer);
      if (tx) {
        toast.success('Player created successfully!');
        console.log('Create player transaction:', tx);
      }
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

  // Let's verify one of the game action handlers to ensure it's using the correct wallet
  const handleCreateGame = async () => {
    const currentWallet = getCurrentWallet();
    if (!program || !currentWallet) return null;
    setIsLoading(true);
    
    try {
      // Add logging to verify wallet being used
      console.log('Creating game with wallet:', {
        type: currentWallet.type,
        address: currentWallet.type === 'test' ? 
          currentWallet.publicKey.toBase58() : 
          currentWallet.address
      });

      const walletPubkey = getWalletPublicKey(currentWallet);
      const signer = getWalletSigner(currentWallet);
      
      // Check wallet balance first
      const balance = await connection.getBalance(walletPubkey);
      console.log('Current wallet balance:', balance / LAMPORTS_PER_SOL, 'SOL');
      
      const requiredBalance = parseFloat(betAmount) + 0.01; // bet amount + buffer for fees
      if (balance < LAMPORTS_PER_SOL * requiredBalance) {
        throw new Error(`Insufficient balance. Need at least ${requiredBalance} SOL`);
      }

      // If using a test wallet, we need to pass the keypair for signing
      const result = await createGame(walletPubkey, betAmount, signer);
      if (!result) {
        throw new Error('Failed to create game');
      }

      // Log successful creation
      console.log('Game created successfully with wallet:', {
        type: currentWallet.type,
        address: currentWallet.type === 'test' ? 
          currentWallet.publicKey.toBase58() : 
          currentWallet.address,
        gamePda: result.gamePda.toString()
      });

      // Wait for transaction confirmation and get game data
      const { confirmed, gameAccount } = await waitForTransactionConfirmation(result.tx, result.gamePda);
      
      if (confirmed && gameAccount) {
        setGamePublicKey(result.gamePda.toString());
        setGameState(gameAccount);
        toast.success('Game created successfully!');
        console.log('Game account:', result.gamePda.toString());
        console.log('Initial game state:', gameAccount);
        return result.gamePda;
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

  // Update other transaction functions to use test wallet keypairs
  const handleJoinGame = async () => {
    const currentWallet = getCurrentWallet();
    if (!program || !gamePublicKey || !currentWallet) return;
    setIsLoading(true);
    try {
      const walletPubkey = getWalletPublicKey(currentWallet);
      const signer = getWalletSigner(currentWallet);
      const tx = await joinGame(walletPubkey, gamePublicKey, signer);
      if (tx) {
        toast.success('Joined game successfully!');
        console.log('Join game transaction:', tx);
        await handleFetchGameState();
      }
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
      const signer = getWalletSigner(currentWallet);
      const moveNumber = parseInt(selectedMove);
      
      const result = await commitMove(walletPubkey, targetGamePda, moveNumber, salt, signer);
      if (!result) {
        throw new Error('Failed to commit move');
      }
      
      setGameState(result.gameAccount);
      toast.success('Move committed successfully!');
      console.log('Updated game state:', result.gameAccount);
    } catch (error) {
      console.error('Error committing move:', error);
      toast.error('Failed to commit move');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevealMove = async () => {
    const currentWallet = getCurrentWallet();
    if (!program || !gamePublicKey || !currentWallet || !selectedMove || !gameState) return;
    setIsLoading(true);
    try {
      const walletPubkey = getWalletPublicKey(currentWallet);
      const signer = getWalletSigner(currentWallet);
      const tx = await revealMove(
        walletPubkey,
        gamePublicKey,
        parseInt(selectedMove),
        salt,
        gameState.playerTwo || gameState.playerOne,
        gameState.vault,
        SystemProgram.programId,
        SystemProgram.programId,
        signer
      );
      
      if (tx) {
        toast.success('Move revealed successfully!');
        console.log('Reveal move transaction:', tx);
        await handleFetchGameState();
      }
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

  // Add useEffect for balance checking
  useEffect(() => {
    const checkBalances = async () => {
      if (!program || !connection) return;
      
      const testWallet = { type: 'test' as const, publicKey: playerTwo.publicKey, keypair: playerTwo };
      const realWallet = solanaWallet ? { type: 'real' as const, address: solanaWallet.address } : null;
      
      // Check test wallet balance
      const testBalance = await checkBalance(testWallet);
      
      // Check real wallet balance
      const realBalance = await checkBalance(realWallet);
      
      setWalletBalances(prev => {
        // Only update if values have actually changed
        if (prev.test === testBalance && prev.real === realBalance) {
          return prev;
        }
        return {
          test: testBalance,
          real: realBalance
        };
      });
    };

    // Initial check
    checkBalances();
    
    // Set up interval with longer delay (10 seconds)
    const intervalId = setInterval(checkBalances, 10000);
    return () => clearInterval(intervalId);
  }, [connection?.rpcEndpoint, program?.programId.toString()]); // Minimize dependencies

  // Update checkBalance function if needed
  const checkBalance = async (wallet: WalletType | null) => {
    if (!wallet || !connection) return 0;
    try {
      const pubkey = wallet.type === 'test' ? wallet.publicKey : new PublicKey(wallet.address);
      const balance = await connection.getBalance(pubkey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error checking balance:', error);
      return 0;
    }
  };

  // Add transfer function after checkBalance function
  const transferSol = async (from: WalletType, to: WalletType, amount: number) => {
    if (!from || from.type !== 'test') return;
    try {
      const transaction = new anchor.web3.Transaction().add(
        SystemProgram.transfer({
          fromPubkey: from.publicKey,
          toPubkey: to.type === 'test' ? to.publicKey : new PublicKey(to.address),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await anchor.web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [from.keypair]
      );

      toast.success(`Transferred ${amount} SOL successfully!`);
      console.log('Transfer signature:', signature);
      
      // Update balances
      await Promise.all([
        checkBalance(from),
        checkBalance(to)
      ]);
    } catch (error) {
      console.error('Error transferring SOL:', error);
      toast.error('Failed to transfer SOL');
    }
  };

  // Add function to check if player account exists
  const checkPlayerAccount = async (wallet: WalletType | null) => {
    if (!program || !wallet) return false;
    try {
      const pubkey = wallet.type === 'test' ? wallet.publicKey : new PublicKey(wallet.address);
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

  // Update useEffect to prevent infinite loops
  useEffect(() => {
    const checkAccounts = async () => {
      if (!program) return; // Exit early if program isn't ready
      
      const testWallet = { type: 'test' as const, publicKey: playerTwo.publicKey, keypair: playerTwo };
      const realWallet = solanaWallet ? { type: 'real' as const, address: solanaWallet.address } : null;
      
      const testExists = await checkPlayerAccount(testWallet);
      const realExists = await checkPlayerAccount(realWallet);
      
      setPlayerAccountsExist(prev => {
        // Only update if values have changed
        if (prev.test === testExists && prev.real === realExists) {
          return prev;
        }
        return {
          test: testExists,
          real: realExists
        };
      });
    };
    
    // Add a small delay to prevent rapid re-checks
    const timeoutId = setTimeout(checkAccounts, 1000);
    return () => clearTimeout(timeoutId);
  }, [program?.programId.toString(), solanaWallet?.address, playerTwo.publicKey.toString()]); // More specific dependencies

  return (
    <div className="space-y-8 p-6 bg-gray-800 rounded-lg">
      <div>
        <h3 className="text-2xl font-semibold mb-2">Rock Paper Scissors Testing Interface</h3>
        <p className="text-gray-400 mb-6">Follow these steps to test the Rock Paper Scissors game on Solana</p>
        
        {/* Wallet Switcher */}
        <div className="border border-gray-700 rounded-lg p-4 mb-8">
          <h4 className="text-lg font-semibold mb-4">Active Wallet</h4>
          <div className="grid grid-cols-2 gap-4">
            {(['real', 'test'] as const).map((walletType) => {
              const isActive = activeWallet === walletType;
              const currentWallet = walletType === 'test' ? 
                { type: 'test', publicKey: playerTwo.publicKey, keypair: playerTwo } :
                (solanaWallet ? { type: 'real', address: solanaWallet.address } : null);
              const balance = walletBalances[walletType] || 0;
              const hasPlayerAccount = playerAccountsExist[walletType];
              
              return (
                <div 
                  key={walletType}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${isActive 
                      ? 'border-gaming-accent bg-gray-700' 
                      : 'border-gray-600 hover:border-gray-500'}`}
                  onClick={() => setActiveWallet(walletType)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{getWalletDisplayName(walletType)}</span>
                    {isActive && (
                      <span className="px-2 py-1 text-xs bg-gaming-accent rounded-full">Active</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {getShortAddress(currentWallet)}
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{balance.toFixed(2)} SOL</span>
                      {walletType !== 'real' && (
                        <span className="text-xs text-gray-400">Pre-funded Test Wallet</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${hasPlayerAccount ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-gray-400">
                        {hasPlayerAccount ? 'Player Account Created' : 'No Player Account'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Player 1:</span>
                      <span className={`px-2 py-0.5 text-sm rounded ${
                        gameState.playerOneMove ? 'bg-green-600' : 
                        gameState.playerOneCommitment ? 'bg-yellow-600' : 
                        'bg-red-600'
                      }`}>
                        {gameState.playerOneMove ? 'Move Revealed' :
                         gameState.playerOneCommitment ? 'Move Encrypted' :
                         'No Move'}
                      </span>
                    </div>
                    {gameState.playerTwo && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm">Player 2:</span>
                        <span className={`px-2 py-0.5 text-sm rounded ${
                          gameState.playerTwoMove ? 'bg-green-600' : 
                          gameState.playerTwoCommitment ? 'bg-yellow-600' : 
                          'bg-red-600'
                        }`}>
                          {gameState.playerTwoMove ? 'Move Revealed' :
                           gameState.playerTwoCommitment ? 'Move Encrypted' :
                           'No Move'}
                        </span>
                      </div>
                    )}
                  </div>
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
