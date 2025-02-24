import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { toast } from 'sonner';
import { validateGameAction, getWalletPublicKey, getWalletSigner } from '@/app/onchain/utils';
import { WalletType } from '../types';
import { TransactionInfo } from './useRPSGameActions';
import { useRPSGameTransactions } from './useRPSGameTransactions';

export type CreateGameResult = {
  tx: string;
  gamePda: PublicKey;
} | null;

export function useRPSGameCreation(
  program: any,
  addTransaction: (info: TransactionInfo) => void,
  setGameState: (state: any) => void
) {
  const { waitForTransactionConfirmation } = useRPSGameTransactions();

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

      const { confirmed, gameAccount } = await waitForTransactionConfirmation(program, tx, gamePda);
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

      const { confirmed, gameAccount } = await waitForTransactionConfirmation(
        program, 
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

  const handleCreateGame = async (
    wallet: WalletType,
    betAmount: string
  ): Promise<PublicKey | null> => {
    const validation = validateGameAction(program, wallet);
    if (!validation.isValid) {
      toast.error(validation.error);
      return null;
    }

    try {
      const walletPubkey = getWalletPublicKey(wallet);
      const signer = getWalletSigner(wallet);
      
      const result = await createGame(walletPubkey, betAmount, signer);
      if (!result) {
        throw new Error('Failed to create game');
      }

      toast.success('Game created successfully!');
      return result.gamePda;
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create game');
      return null;
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
    createGame,
    joinGame,
    handleCreateGame,
    handleJoinGame
  };
} 