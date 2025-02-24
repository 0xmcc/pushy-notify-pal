import { PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { toast } from 'sonner';
import { validateGameAction, getWalletPublicKey, getWalletSigner } from '@/app/onchain/utils';
import { WalletType } from '../types';
import { TransactionInfo } from './useRPSGameActions';

export function useRPSJoinGame(
  program: any,
  addTransaction: (info: TransactionInfo) => void,
  setGameState: (state: any) => void
) {
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

      setGameState(gameAccount);
      return tx;
    } catch (error) {
      console.error('Error joining game:', error);
      throw error;
    }
  };

  const handleJoinGame = async (wallet: WalletType, gamePublicKey: string) => {
    const validation = validateGameAction(program, wallet, gamePublicKey);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      const walletPubkey = getWalletPublicKey(wallet);
      const signer = getWalletSigner(wallet);
      
      const tx = await joinGame(walletPubkey, gamePublicKey, signer);
      if (tx) {
        toast.success('Game joined successfully!');
        return tx;
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