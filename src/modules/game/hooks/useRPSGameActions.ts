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
import { useRPSGameSettlement } from './useRPSGameSettlement';

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
    } = useRPSGameSettlement(program, addTransaction, setGameState);
  

    const handleFetchGameState = async (gamePublicKey: string) => {
        if (!program || !gamePublicKey) return;
        try {
            const gameAccount = await program.account.game.fetch(new PublicKey(gamePublicKey));
            setGameState(gameAccount);
            return gameAccount;
        } catch (error) {
            console.error('Error fetching game state:', error);
            toast.error('Failed to fetch game state');
        }
    };

    const handleCreateGameAndCommit = async (
        wallet: WalletType,
        betAmount: string,
        selectedMove: string,
        setGamePublicKey: (key: string) => void,
        setMoveCommitments: (fn: (prev: any) => any) => void
    ) => {
        const validation = validateGameAction(program, wallet);
        if (!validation.isValid) {
            toast.error(validation.error);
            return;
        }

        try {
            const walletPubkey = getWalletPublicKey(wallet);
            const signer = getWalletSigner(wallet);
            
            // First create the game
            const result = await createGame(walletPubkey, betAmount, signer);
            if (!result) {
                throw new Error('Failed to create game');
            }
            
            setGamePublicKey(result.gamePda.toString());

            // Then commit the move
            const moveNumber = parseInt(selectedMove);
            const salt = crypto.getRandomValues(new Uint8Array(32));
            
            const commitResult = await commitMove(
                walletPubkey,
                result.gamePda,
                moveNumber,
                salt,
                signer
            );

            if (commitResult) {
                setMoveCommitments(prev => ({
                    ...prev,
                    [result.gamePda.toString()]: {
                        playerOne: { move: selectedMove, salt }
                    }
                }));
                
                toast.success('Game created and move committed successfully!');
                return result.gamePda;
            }
        } catch (error) {
            console.error('Error in create and commit:', error);
            toast.error('Failed to create game and commit move');
            throw error;
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
        handleRevealMove,
        handleClaimWinnings,
    };
} 