import { useState, useCallback } from 'react';
import { useRPS } from '@/providers/RPSProvider';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Connection, clusterApiUrl, Keypair } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { toast } from 'sonner';
import { SolanaGameState } from '../types';

export type TransactionInfo = {
  type: 'create_game' | 'join_game' | 'commit_move' | 'reveal_move';
  signature: string;
  timestamp: number;
  gameAccount?: string;
};

export type CreateGameResult = {
  tx: string;
  gamePda: PublicKey;
} | null;

export type CommitMoveResult = {
  tx: string;
  gameAccount: any;
} | null;

export type TransactionConfirmationResult = {
  confirmed: boolean;
  gameAccount: any;
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
  
    // Move waitForTransactionConfirmation into the hook
    const waitForTransactionConfirmation = async (
        signature: string,
        gamePda: PublicKey
    ): Promise<TransactionConfirmationResult> => {
        let timeoutCount = 0;
        const maxTimeout = 30; // 30 seconds timeout
        
        while (timeoutCount < maxTimeout) {
            const status = await connection.getParsedTransaction(signature, {
                maxSupportedTransactionVersion: 0,
            });
            
            if (status) {
                if (status.meta?.err) {
                    throw new Error(`Transaction failed: ${JSON.stringify(status.meta.err)}`);
                }
                
                if (status.blockTime && status.slot) {
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

    const createGame = async (
      walletPubkey: PublicKey, 
      betAmount: string,
      signer?: Keypair
    ): Promise<CreateGameResult> => {
      if (!program) return null;
      
      try {
        const creationTimestamp = new BN(new Date().getTime());
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
  
        const tx = await program.methods
          .createGame(creationTimestamp, betAmountLamports)
          .accounts({
            playerOne: walletPubkey,
            gameAccount: gamePda,
            gameVault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers(signer ? [signer] : [])
          .rpc();
  
        addTransaction({
          type: 'create_game',
          signature: tx,
          timestamp: Date.now(),
          gameAccount: gamePda.toString()
        });
  
        // Wait for confirmation here
        const { confirmed, gameAccount } = await waitForTransactionConfirmation(tx, gamePda);
        if (!confirmed) {
            throw new Error('Transaction failed to confirm');
        }

        setGameState(gameAccount);
        return { tx, gamePda };
      } catch (error) {
        console.error('Error creating game:', error);
        throw error;
      }
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

    const commitMove = async (
        walletPubkey: PublicKey,
        gamePda: PublicKey,
        moveNumber: number,
        salt: Uint8Array,
        signer?: Keypair
    ): Promise<CommitMoveResult> => {
        if (!program) return null;

        try {
            // Create commitment using the helper function
            const commitment = await createCommitment(moveNumber, salt);
            
            // Get game vault PDA
            const [vaultPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("vault"), gamePda.toBuffer()],
                program.programId
            );

            const tx = await program.methods.commitMove(
                Array.from(commitment)
            )
            .accounts({
                player: walletPubkey,
                game: gamePda,
                vault: vaultPda,
                systemProgram: SystemProgram.programId,
            })
            .signers(signer ? [signer] : [])
            .rpc();

            addTransaction({
                type: 'commit_move',
                signature: tx,
                timestamp: Date.now(),
                gameAccount: gamePda.toString()
            });

            // Wait for confirmation and get updated game state
            const { confirmed, gameAccount } = await waitForTransactionConfirmation(tx, gamePda);
            if (!confirmed) {
                throw new Error('Transaction failed to confirm');
            }

            setGameState(gameAccount);
            return { tx, gameAccount };
        } catch (error) {
            console.error('Error committing move:', error);
            throw error;
        }
    };

    const createPlayer = async (
      playerPubkey: PublicKey,
      signer?: Keypair
    ): Promise<string | null> => {
        if (!program) {
            console.log('Program not initialized');
            return null;
        }
        
        try {
            console.log('=== Create Player Debug Logs ===');
            console.log('Player Public Key:', playerPubkey.toBase58());
            console.log('Has Signer:', !!signer);
            console.log('Program ID:', program.programId.toBase58());

            const [playerPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("player"), playerPubkey.toBuffer()],
                program.programId
            );

            const [vaultPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("vault"), playerPubkey.toBuffer()],
                program.programId
            );

            console.log('PDAs:', {
                playerPda: playerPda.toBase58(),
                vaultPda: vaultPda.toBase58(),
                seeds: {
                    player: ['player', playerPubkey.toBase58()],
                    vault: ['vault', playerPubkey.toBase58()]
                }
            });

            const tx = await program.methods
                .createPlayer()
                .accounts({
                    user: playerPubkey,
                    playerAccount: playerPda,
                    vault: vaultPda,
                    systemProgram: SystemProgram.programId,
                })
                .signers(signer ? [signer] : [])
                .rpc();
            
            addTransaction({
                type: 'create_game',
                signature: tx,
                timestamp: Date.now()
            });

            console.log('Transaction successful:', tx);
            return tx;
        } catch (error) {
            console.error('=== Create Player Error Details ===');
            console.error('Full error:', error);
            throw error;
        }
    };

    const joinGame = async (
      walletPubkey: PublicKey, 
      gamePublicKey: string,
      signer?: Keypair
    ): Promise<string | null> => {
        if (!program) return null;
        try {
            const tx = await program.methods.joinGame()
                .accounts({
                    playerTwo: walletPubkey,
                    gameAccount: new PublicKey(gamePublicKey),
                    systemProgram: SystemProgram.programId,
                })
                .signers(signer ? [signer] : [])
                .rpc();
            
            addTransaction({
                type: 'join_game',
                signature: tx,
                timestamp: Date.now(),
                gameAccount: gamePublicKey
            });

            // Wait for confirmation and update game state
            const { confirmed, gameAccount } = await waitForTransactionConfirmation(
                tx, 
                new PublicKey(gamePublicKey)
            );
            if (!confirmed) {
                throw new Error('Transaction failed to confirm');
            }

            setGameState(gameAccount);
            return tx;
        } catch (error) {
            console.error('Error joining game:', error);
            throw error;
        }
    };

    const revealMove = async (
        walletPubkey: PublicKey,
        gamePublicKey: string,
        moveNumber: number,
        salt: Uint8Array,
        opponent: PublicKey,
        gameVault: PublicKey,
        playerVault: PublicKey,
        opponentVault: PublicKey,
        signer?: Keypair
    ): Promise<string | null> => {
        if (!program) return null;
        try {
            const tx = await program.methods.revealMove(
                moveNumber,
                Array.from(salt)
            )
            .accounts({
                player: walletPubkey,
                opponent,
                game: new PublicKey(gamePublicKey),
                gameVault,
                playerVault,
                opponentVault,
                systemProgram: SystemProgram.programId,
            })
            .signers(signer ? [signer] : [])
            .rpc();
            
            addTransaction({
                type: 'reveal_move',
                signature: tx,
                timestamp: Date.now(),
                gameAccount: gamePublicKey
            });

            // Wait for confirmation and update game state
            const { confirmed, gameAccount } = await waitForTransactionConfirmation(
                tx, 
                new PublicKey(gamePublicKey)
            );
            if (!confirmed) {
                throw new Error('Transaction failed to confirm');
            }

            setGameState(gameAccount);
            return tx;
        } catch (error) {
            console.error('Error revealing move:', error);
            throw error;
        }
    };
  
    return {
        isLoading,
        gameState,
        transactions,
        createGame,
        commitMove,
        createPlayer,
        joinGame,
        revealMove,
        waitForTransactionConfirmation,
    };
} 