import { useState, useCallback } from 'react';
import { useRPS } from '@/providers/RPSProvider';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Connection, clusterApiUrl, Keypair } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { toast } from 'sonner';
import { SolanaGameState } from '../types';
import { 
  getWalletPublicKey, 
  getWalletSigner, 
  validateGameAction 
} from '@/app/onchain/utils';
import { WalletType } from '../types';

// Import our new hooks
import { useRPSCreateGame } from './useRPSCreateGame';
import { useRPSJoinGame } from './useRPSJoinGame';
import { useRPSCommitMove } from './useRPSCommitMove';
import { useRPSRevealMove } from './useRPSRevealMove';
import { useRPSGamePlayer } from './useRPSGamePlayer';
import { useRPSGameClaimWinnings } from './useRPSGameClaimWinnings';
import { syncGameToSupabase } from './useSolanaGameStateSync';
import { useRPSGameCompositeActions } from './useRPSGameCompositeActions';

export type TransactionInfo = {
  type: 'create_game' | 'join_game' | 'commit_move' | 'reveal_move' | 'claim_winnings';
  signature: string;
  timestamp: number;
  gameAccount?: string;
};

export function useRPSGameActions() {
    const { program } = useRPS();
    const connection = new Connection(clusterApiUrl('devnet'));
    
    const [isLoading, setIsLoading] = useState(false);
    const [gameState, setGameState] = useState<any>(null);
    const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  
    const addTransaction = useCallback((info: TransactionInfo) => {
      setTransactions(prev => [info, ...prev]);
    }, []);
  

    // Import game creation functionality
    const {
      createGame,
      handleCreateGame
    } = useRPSCreateGame(program, addTransaction, setGameState);

    // Import join game functionality
    const {
        joinGame,
        handleJoinGame
    } = useRPSJoinGame(program, addTransaction, setGameState);
  
    // Import commit move functionality
    const {
      commitMove,
      handleCommitMove
    } = useRPSCommitMove(program, addTransaction, setGameState);

    // Import reveal move functionality
    const {
      revealMove,
      handleRevealMove
    } = useRPSRevealMove(program, addTransaction, setGameState);

    // Import player functionality
    const {
      createPlayer,
      handleCreatePlayer
    } = useRPSGamePlayer(program, addTransaction, setGameState);

    // Import settlement functionality
    const {
      claimWinnings,
      handleClaimWinnings
    } = useRPSGameClaimWinnings(program, addTransaction, setGameState);

    // Import composite actions
    const {
      handleCreateGameAndCommit,
      handleJoinGameAndCommit
    } = useRPSGameCompositeActions(program, addTransaction, setGameState);
  

    const handleFetchGameState = async (gamePublicKey: string) => {
        if (!program || !gamePublicKey) return;
        try {
            const gameAccount = await program.account.game.fetch(new PublicKey(gamePublicKey));
            setGameState(gameAccount);
            
            // Sync to Supabase
            await syncGameToSupabase(gameAccount, gamePublicKey);
            
            return gameAccount;
        } catch (error) {
            console.error('Error fetching game state:', error);
            toast.error('Failed to fetch game state');
        }
    };

    return {
        isLoading,
        gameState,
        transactions,
        createGame,
        joinGame,
        commitMove,
        revealMove,
        createPlayer,
        claimWinnings,
        handleCreateGame,
        handleJoinGame,
        handleCreatePlayer,
        handleCommitMove,
        handleFetchGameState,
        handleCreateGameAndCommit,
        handleJoinGameAndCommit,
        handleRevealMove,
        handleClaimWinnings,
    };
} 