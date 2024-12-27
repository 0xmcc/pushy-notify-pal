import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { IDL } from '@/types/rps_game';
import { createWalletAdapter } from '@/utils/wallet-adapter';
import { Wallet } from '@privy-io/react-auth';

const PROGRAM_ID = "8LCEgTSrryvRuX3AE46Pa1msev4CfPXZiiWzbg6Vk8bn";
const DEVNET_ENDPOINT = "https://api.devnet.solana.com";

export const getProgram = async (wallet: Wallet) => {
  console.log('Initializing program with wallet:', wallet.address);
  
  try {
    const connection = new Connection(DEVNET_ENDPOINT);
    console.log('Connected to Solana network:', DEVNET_ENDPOINT);
    
    const walletAdapter = createWalletAdapter(wallet);
    console.log('Wallet adapter created');

    const provider = new anchor.AnchorProvider(
      connection,
      walletAdapter,
      { commitment: 'processed' }
    );
    console.log('Provider set');

    const program = new anchor.Program(
      IDL,
      new PublicKey(PROGRAM_ID),
      provider
    );
    console.log('Program initialized with ID:', PROGRAM_ID);

    return program;
  } catch (error) {
    console.error('Error initializing program:', error);
    throw error;
  }
};