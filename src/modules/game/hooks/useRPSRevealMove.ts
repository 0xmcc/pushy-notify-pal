import { PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { toast } from 'sonner';
import { validateGameAction, getWalletPublicKey, getWalletSigner } from '@/app/onchain/utils';
import { WalletType } from '@/types';
import { TransactionInfo } from './useRPSGameActions';
import { useRPSGameTransactions } from './useRPSGameTransactions';

export function useRPSRevealMove(
  program: any,
  addTransaction: (info: TransactionInfo) => void,
  setGameState: (state: any) => void
) {
  const { waitForTransactionConfirmation } = useRPSGameTransactions();

  const revealMove = async (
    walletPubkey: PublicKey,
    gamePublicKey: string,
    moveNumber: number,
    salt: Uint8Array,
    opponent: PublicKey,
    gameVault: PublicKey,
    playerVaultPda: PublicKey,
    opponentVaultPda: PublicKey,
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
        opponent: opponent,
        game: new PublicKey(gamePublicKey),
        gameVault: gameVault,
        playerVault: playerVaultPda,
        opponentVault: opponentVaultPda,
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

  const handleRevealMove = async (
    wallet: WalletType,
    gamePublicKey: string,
    moveNumber: number,
    salt: Uint8Array
  ) => {
    const validation = validateGameAction(program, wallet, gamePublicKey);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      const walletPubkey = getWalletPublicKey(wallet);
      const signer = getWalletSigner(wallet);
      
      const gamePda = new PublicKey(gamePublicKey);
      const gameAccount = await program?.account.game.fetch(gamePda);
      
      const opponent = gameAccount.playerOne.toString() === walletPubkey.toString() 
        ? gameAccount.playerTwo 
        : gameAccount.playerOne;

      const [playerVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), walletPubkey.toBuffer()],
        program.programId
      );
      
      const [opponentVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), opponent.toBuffer()],
        program.programId
      );

      const tx = await revealMove(
        walletPubkey,
        gamePublicKey,
        moveNumber,
        salt,
        opponent,
        gameAccount.vault,
        playerVaultPda,
        opponentVaultPda,
        signer
      );
      
      if (tx) {
        toast.success('Move revealed successfully!');
        return tx;
      }
    } catch (error) {
      console.error('Error revealing move:', error);
      toast.error('Failed to reveal move');
      throw error;
    }
  };

  return {
    revealMove,
    handleRevealMove
  };
} 