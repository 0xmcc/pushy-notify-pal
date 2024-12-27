import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { IDL } from '@/types/rps_game';
import { createWalletAdapter } from '@/utils/wallet-adapter';
import { Wallet } from '@privy-io/react-auth';

const PROGRAM_ID = "8LCEgTSrryvRuX3AE46Pa1msev4CfPXZiiWzbg6Vk8bn";
const DEVNET_ENDPOINT = "https://api.devnet.solana.com";

export const getProgram = async (wallet: Wallet) => {
  const connection = new Connection(DEVNET_ENDPOINT);
  const walletAdapter = createWalletAdapter(wallet);

  const provider = new anchor.AnchorProvider(
    connection,
    walletAdapter as any,
    { commitment: 'processed' }
  );

  anchor.setProvider(provider);

  return new anchor.Program(
    IDL as any,
    new PublicKey(PROGRAM_ID),
    provider
  );
};