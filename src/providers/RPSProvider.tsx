'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';

import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { toast } from "sonner";
import { IDL, RpsGame } from '@/types/rps_game';


// Use - https://docs.privy.io/guide/expo/embedded/solana/usage
// Code sample - https://github.com/arrayappy/privy
// Docs - https://docs.privy.io/guide/expo/embedded/solana/creation

const DEVNET_ENDPOINT = 'https://api.devnet.solana.com';
const PROGRAM_ID = 'HhQS1b126xUXvVpQ6qbZPhSi2PhDgtBFTe7hqNfkXeWZ';

export const RPSContext = createContext<anchor.Program<RpsGame> | null>(null);

export function useRPS() {
  const context = useContext(RPSContext);
  if (!context) {
    throw new Error('useRPS must be used within RPSProvider');
  }
  return context;
}

export function RPSProvider({ children }: { children: React.ReactNode }) {
  const [program, setProgram] = useState<anchor.Program<RpsGame> | null>(null);
  const { wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];

  useEffect(() => {
    const initializeProgram = async () => {
      if (!solanaWallet?.address) {
        console.log("Waiting for wallet...");
        return;
      }

      try {
        const connection = new Connection(DEVNET_ENDPOINT);
        const walletAdapter = {
          publicKey: new PublicKey(solanaWallet.address),
          signTransaction: solanaWallet.signTransaction,
          signAllTransactions: async (transactions) => {
            return Promise.all(transactions.map(tx => solanaWallet.signTransaction(tx)));
          },
        };

        const provider = new anchor.AnchorProvider(
          connection,
          walletAdapter,
          { commitment: 'confirmed' }
        );
        
        anchor.setProvider(provider);

        // Match the working example's Program creation
        const rpsProgram = new anchor.Program(
          IDL,
          new PublicKey(PROGRAM_ID),
          provider
        );

        console.log("Program created successfully");
        setProgram(rpsProgram);
      } catch (err) {
        console.error('Failed to initialize RPS program:', err);
//        toast.error('Failed to initialize game program');
      }
    };

    initializeProgram();
  }, [solanaWallet?.address]);

  return (
    <RPSContext.Provider value={program}>
      {children}
    </RPSContext.Provider>
  );
}    
