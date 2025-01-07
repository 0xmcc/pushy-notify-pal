'use client';

import { Buffer } from 'buffer';
import { createContext, useContext, ReactNode } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { clusterApiUrl, Connection, PublicKey, Transaction } from '@solana/web3.js';
import { IDL, RpsGame } from '@/types/rps_game';
import { createWalletAdapter } from '@/utils/wallet-adapter';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';


const PROGRAM_ID = "AdNRN8coBzuAPKiKPz4uxEQrgDDp2ZxXjtXfu6NnYKSg";


export interface RPSContextType {
  createGame: (stakeAmount: number) => Promise<string>;
  initializePlayer: () => Promise<string>;
  client: any;
  connected: boolean;
}

const RPSContext = createContext<RPSContextType>({
  createGame: async () => '',
  initializePlayer: async () => '',
  client: null,
  connected: false,
});

export const useRPS = () => {
  return useContext(RPSContext);
};

interface RPSProviderProps {
  children: ReactNode;
}

export const RPSProvider = ({ children }: RPSProviderProps) => {
  const { user, authenticated, logout, login } = usePrivy();
	const { ready, wallets, createWallet } = useSolanaWallets();
	const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const getProgram = () => {
    if (!user) throw new Error('User not authenticated!');
    if (wallets.length < 1) throw new Error('Wallet not connected');

    const walletAdapter = createWalletAdapter(wallets[0]);
		const provider = new anchor.AnchorProvider<RpsGame>(
		  connection,
		  walletAdapter,
		  { commitment: 'processed' }
		);

    anchor.setProvider(provider);

		const program = new anchor.Program(
		  IDL,
		  new PublicKey(PROGRAM_ID),
		  provider
		);

    return program;
  };

  const createGame = async (stakeAmount: number): Promise<string> => {
    try {
      const wallet = wallets[0];
      const program = getProgram();
      const tx = new Transaction();
      // Add game creation instruction
      const signature = await wallet.sendTransaction(tx, program.provider.connection);
      return signature;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  };

  const initializePlayer = async (): Promise<string> => {
    if (!user) return;
		const publicKey = new PublicKey(user.wallet?.address || '');
		console.log("publicKey: ", publicKey.toString());

		const program = getProgram();
		if (!program) return;

		// Derive player PDAs
		const [playerPda] = PublicKey.findProgramAddressSync(
		  [Buffer.from("player"), publicKey.toBuffer()],
		  program.programId
		);

    console.log("pDA: ", playerPda.toString());

		const [playerOneVaultPda] = PublicKey.findProgramAddressSync(
		  [Buffer.from("vault"), publicKey.toBuffer()],
		  program.programId
		);

		console.log("vaultPDA: ", playerOneVaultPda.toString());

		try {
		  // Create player one PDA
		  const tx = await program.methods
        .createPlayer()
        .accounts({
          playerAccount: playerPda,
          vault: playerOneVaultPda,
          user: publicKey,
        })
        // .signers([publicKey])
        .rpc({ commitment: "confirmed" });

      console.log("Created player one! Transaction signature:", tx);

      return tx;
		} catch (error) {
		  console.error("Error creating player: ", error);
      throw error;
		}
  };

  const value = {
    createGame,
    initializePlayer,
    client: getProgram,
    connected: authenticated,
  };

  return <RPSContext.Provider value={value}>{children}</RPSContext.Provider>;
};