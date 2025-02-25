import { PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { toast } from 'sonner';
import { validateGameAction, getWalletPublicKey, getWalletSigner } from '@/app/onchain/utils';
import { WalletType } from '../types';
import { TransactionInfo } from './useRPSGameActions';
import { useRPSGameTransactions } from './useRPSGameTransactions';

export function useRPSJoinGame(
  program: any,
  addTransaction: (info: TransactionInfo) => void,
  setGameState: (state: any) => void
) {
  const { waitForTransactionConfirmation } = useRPSGameTransactions();

  /**
   * Join a game
   * @param walletPubkey - The public key of the wallet
   * @param gamePublicKey - The public key of the game
   * @param signer - The signer of the transaction
   * @returns The transaction signature
   */
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
      console.log('Game joined successfully!', tx);

      return tx;
    } catch (error) {
      console.error('Error joining game:', error);
      throw error;
    }
  };

  const handleJoinGame = async (wallet: WalletType, gamePublicKey: string) => {
    const validation = validateGameAction(program, wallet);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      const walletPubkey = getWalletPublicKey(wallet);
      const signer = getWalletSigner(wallet);
      
      const tx = await joinGame(walletPubkey, gamePublicKey, signer);
      if (tx) {
        const { gameAccount } = await waitForTransactionConfirmation(program, tx, new PublicKey(gamePublicKey));
        toast.success('Game joined successfully!');
        return {tx, gameAccount};
      }
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game');
      throw error;
    }
  };

  return {
    joinGame,
    handleJoinGame
  };
} 