import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { toast } from 'sonner';
import { validateGameAction, getWalletPublicKey, getWalletSigner } from '@/app/onchain/utils';
import { WalletType } from '../types';
import { TransactionInfo } from './useRPSGameActions';

export type CreateGameResult = {
  tx: string;
  gamePda: PublicKey;
  gameAccount: any;
} | null;

export function useRPSCreateGame(
  program: any,
  addTransaction: (info: TransactionInfo) => void,
  setGameState: (state: any) => void
) {
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

    
      return { tx, gamePda, gameAccount: gamePda };
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  };

  const handleCreateGame = async (
    wallet: WalletType,
    betAmount: string
  ): Promise<CreateGameResult | null> => {
    console.log('handleCreateGame wallet1:', wallet, betAmount);
    const validation = validateGameAction(program, wallet);
    if (!validation.isValid) {
      toast.error(validation.error);
      return null;
    }
    console.log('handleCreateGame wallet 2:', wallet, betAmount);
    try {
      const walletPubkey = getWalletPublicKey(wallet);
      const signer = getWalletSigner(wallet);
      
      const result = await createGame(walletPubkey, betAmount, signer);
      if (!result) {
        throw new Error('Failed to create game');
      }

  
      toast.success('Game created successfully!');
      return result;
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create game');
      return null;
    }
  };

  return {
    createGame,
    handleCreateGame
  };
} 