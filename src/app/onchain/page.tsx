import React, { useEffect, useState } from 'react';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { RPSProvider, useRPS } from '@/providers/RPSProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
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

const RPSTestingInterface = () => {
  const { program } = useRPS();
  const { wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];
  
  const [betAmount, setBetAmount] = useState('0.1');
  const [gamePublicKey, setGamePublicKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const [selectedMove, setSelectedMove] = useState<string>('');
  const [salt] = useState(() => crypto.getRandomValues(new Uint8Array(32)));
  const [activeWallet, setActiveWallet] = useState<'real' | 'test1' | 'test2'>('real');
  
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

  const handleCreateGame = async () => {
    const currentWallet = getCurrentWallet();
    if (!program || !currentWallet) return;
    setIsLoading(true);
    try {
      const walletPubkey = getWalletPublicKey(currentWallet);
      // Derive the game account PDA
      const [gameAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("game"), walletPubkey.toBuffer(), new BN(Date.now()).toArrayLike(Buffer)],
        new PublicKey(PROGRAM_ID)
      );
      
      // Derive the game's vault PDA
      const [gameVault] = PublicKey.findProgramAddressSync(
        [Buffer.from("game_vault"), gameAccount.toBuffer()],
        new PublicKey(PROGRAM_ID)
      );

      const tx = await program.methods.createGame(
        new BN(new Date().getTime()),
        new BN(parseFloat(betAmount) * 1e9)
      )
      .accounts({
        playerOne: walletPubkey,
        gameAccount,
        gameVault,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
      
      setGamePublicKey(gameAccount.toString());
      toast.success('Game created successfully!');
      console.log('Create game transaction:', tx);
      await handleFetchGameState(gameAccount.toString());
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
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
      await handleFetchGameState();
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommitMove = async () => {
    const currentWallet = getCurrentWallet();
    if (!program || !gamePublicKey || !currentWallet || !selectedMove) return;
    setIsLoading(true);
    try {
      const walletPubkey = getWalletPublicKey(currentWallet);
      // Create commitment by hashing move with salt
      const moveNumber = parseInt(selectedMove);
      const commitment = await crypto.subtle.digest(
        'SHA-256',
        new Uint8Array([moveNumber, ...salt])
      );
      
      const tx = await program.methods.commitMove(
        Array.from(new Uint8Array(commitment))
      )
      .accounts({
        player: walletPubkey,
        game: new PublicKey(gamePublicKey),
        vault: SystemProgram.programId, // This needs to be the correct vault PDA
        systemProgram: SystemProgram.programId,
      })
      .rpc();
      
      toast.success('Move committed successfully!');
      console.log('Commit move transaction:', tx);
      await handleFetchGameState();
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
      await handleFetchGameState();
    } catch (error) {
      console.error('Error revealing move:', error);
      toast.error('Failed to reveal move');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchGameState = async (pubkey?: string) => {
    if (!program || (!gamePublicKey && !pubkey)) return;
    try {
      const gameAccount = await program.account.game.fetch(pubkey || gamePublicKey);
      setGameState(gameAccount);
      console.log('Game state:', gameAccount);
    } catch (error) {
      console.error('Error fetching game state:', error);
      toast.error('Failed to fetch game state');
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
                  <Button 
                    onClick={handleCreateGame}
                    disabled={isLoading || !program}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Create New Game
                  </Button>
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
                  onClick={handleCommitMove}
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
            <div className="border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold">Current Game Status</h4>
                <span className="text-sm text-gray-400">
                  Using: {getWalletDisplayName(activeWallet)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-gray-700 rounded">
                  <span>Game Status:</span>
                  <span className="font-medium">{gameState.state.active ? 'Active' : 'Finished'}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-700 rounded">
                  <span>Bet Amount:</span>
                  <span className="font-medium">{(Number(gameState.betAmount) / 1e9).toFixed(2)} SOL</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-700 rounded">
                  <span>Player 1:</span>
                  <span className="font-medium">{gameState.playerOne.toString().slice(0, 4)}...{gameState.playerOne.toString().slice(-4)}</span>
                </div>
                {gameState.playerTwo && (
                  <div className="flex justify-between p-2 bg-gray-700 rounded">
                    <span>Player 2:</span>
                    <span className="font-medium">{gameState.playerTwo.toString().slice(0, 4)}...{gameState.playerTwo.toString().slice(-4)}</span>
                  </div>
                )}
                {gameState.winner && (
                  <div className="flex justify-between p-2 bg-gray-700 rounded">
                    <span>Winner:</span>
                    <span className="font-medium">{gameState.winner.toString().slice(0, 4)}...{gameState.winner.toString().slice(-4)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
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
