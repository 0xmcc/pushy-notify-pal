import { PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { toast } from 'sonner';
import { validateGameAction, getWalletPublicKey, getWalletSigner } from '@/app/onchain/utils';
import { WalletType } from '../types';
import { TransactionInfo } from './useRPSGameActions';
import { useRPSGameTransactions } from './useRPSGameTransactions';
import { useState } from 'react';

export type CommitMoveResult = {
  tx: string;
  gameAccount: any;
} | null;

export function useRPSCommitMove(
  program: any,
  addTransaction: (info: TransactionInfo) => void,
  setGameState: (state: any) => void
) {
  const { waitForTransactionConfirmation } = useRPSGameTransactions();

  const commitMove = async (
    walletPubkey: PublicKey,
    gamePda: PublicKey,
    moveNumber: number,
    salt: Uint8Array,
    signer?: Keypair
  ): Promise<CommitMoveResult> => {
    if (!program) return null;

    try {
      const commitment = await createCommitment(moveNumber, salt);
      
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

      const { confirmed, gameAccount } = await waitForTransactionConfirmation(program, tx, gamePda);
      if (!confirmed) {
        throw new Error('Transaction failed to confirm');
      }

      setGameState(gameAccount);
      return { tx, gameAccount};
    } catch (error) {
      console.error('Error committing move:', error);
      throw error;
    }
  };

  const handleCommitMove = async (
    wallet: WalletType,
    gamePublicKey: string,
    move: string
  ) => {

    const validation = validateGameAction(program, wallet);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      const walletPubkey = getWalletPublicKey(wallet);
      const signer = getWalletSigner(wallet);
      const salt = crypto.getRandomValues(new Uint8Array(32));
      const moveNumber = parseInt(move);
      
      const result = await commitMove(
        walletPubkey,
        new PublicKey(gamePublicKey),
        moveNumber,
        salt,
        signer
      );

      if (result) {
        toast.success('Move committed successfully!');
        return { tx: result.tx, gameAccount: result.gameAccount, moveNumber: moveNumber, salt: salt, walletPubkey: walletPubkey };
      }
    } catch (error) {
      console.error('Error committing move:', error);
      toast.error('Failed to commit move');
      throw error;
    }
  };

  return {
    commitMove,
    handleCommitMove
  };
} 

const createCommitment = async (move: number, salt: Uint8Array): Promise<Uint8Array> => {
  const moveBytes = new Uint8Array([move]);
  const combinedArray = new Uint8Array(moveBytes.length + salt.length);
  combinedArray.set(moveBytes);
  combinedArray.set(salt, moveBytes.length);
  const hashBuffer = await crypto.subtle.digest('SHA-256', combinedArray);
  return new Uint8Array(hashBuffer);
};