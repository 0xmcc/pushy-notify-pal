import { PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { toast } from 'sonner';
import { getWalletPublicKey, getWalletSigner } from '@/app/onchain/utils';
import { WalletType } from '@/types';
import { TransactionInfo } from './useRPSGameActions';

export function useRPSGamePlayer(
  program: any,
  addTransaction: (info: TransactionInfo) => void,
  setGameState: (state: any) => void
) {
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

      console.log('Transaction signature:', tx);
      return tx;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  };

  const handleCreatePlayer = async (wallet: WalletType) => {
    try {
      const walletPubkey = getWalletPublicKey(wallet);
      const signer = getWalletSigner(wallet);
      
      const tx = await createPlayer(walletPubkey, signer);
      if (tx) {
        toast.success('Player created successfully!');
        return tx;
      }
    } catch (error) {
      console.error('Error creating player:', error);
      toast.error('Failed to create player');
      throw error;
    }
  };

  return {
    createPlayer,
    handleCreatePlayer
  };
} 