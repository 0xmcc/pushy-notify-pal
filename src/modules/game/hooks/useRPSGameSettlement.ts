import { PublicKey, SystemProgram, Keypair, Connection, clusterApiUrl } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { toast } from 'sonner';
import { TransactionInfo } from './useRPSGameActions';

export function useRPSGameSettlement(
  program: any,
  addTransaction: (info: TransactionInfo) => void,
  setGameState: (state: any) => void
) {
  const connection = new Connection(clusterApiUrl('devnet'));

  const claimWinnings = async (
    walletPubkey: PublicKey,
    gamePublicKey: string,
    betAmount: BN,
    signer?: Keypair
  ): Promise<string | null> => {
    if (!program) return null;
    try {
      // Get player vault PDA
      const [playerVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), walletPubkey.toBuffer()],
        program.programId
      );

      // Get game vault PDA
      const [gameVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), new PublicKey(gamePublicKey).toBuffer()],
        program.programId
      );

      // Check if vault has already been claimed
      const gameVaultBalance = await connection.getBalance(gameVaultPda);
      if (gameVaultBalance === 0) {
        throw new Error('Winnings have already been claimed');
      }
      // Use the actual vault balance instead of calculating it
      const vaultAmount = new BN(gameVaultBalance);

      const tx = await program.methods
        .claimWinnings(vaultAmount)
        .accounts({
          player: walletPubkey,
          vault: playerVaultPda,
          gameVault: gameVaultPda,
          systemProgram: SystemProgram.programId,
        })
        .signers(signer ? [signer] : [])
        .rpc();

      addTransaction({
        type: 'claim_winnings',
        signature: tx,
        timestamp: Date.now(),
        gameAccount: gamePublicKey
      });

      return tx;
    } catch (error) {
      console.error('Error claiming winnings:', error);
      throw error;
    }
  };

  const handleClaimWinnings = async (
    walletPubkey: PublicKey,
    gamePublicKey: string,
    gameState: any,
    signer?: Keypair
  ) => {
    if (!program || !gameState) {
      toast.error('Program or game state not initialized');
      return;
    }

    try {
      if (gameState.winner?.toString() !== walletPubkey.toString()) {
        toast.error('Only the winner can claim winnings');
        return;
      }

      const tx = await claimWinnings(
        walletPubkey,
        gamePublicKey,
        new BN(gameState.betAmount.toString()),
        signer
      );

      if (tx) {
        toast.success('Winnings claimed successfully!');
        return tx;
      }
    } catch (error) {
      console.error('Error claiming winnings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to claim winnings';
      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    claimWinnings,
    handleClaimWinnings
  };
} 