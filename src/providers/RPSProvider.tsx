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

interface RPSContextValue {
  program: anchor.Program<RpsGame> | null;
  isLoading: boolean;
  error: Error | null;
}

export const RPSContext = createContext<RPSContextValue | undefined>(undefined);

export function useRPS() {
  const context = useContext(RPSContext);
  if (!context) {
    throw new Error('useRPS must be used within RPSProvider');
  }
  return context;
}

export function RPSProvider({ children }: { children: React.ReactNode }) {
  const mountId = React.useRef(Math.random());
  console.log("[RPSProvider] Mounting, ID:", mountId.current);
  
  const [program, setProgram] = useState<anchor.Program<RpsGame> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];

  useEffect(() => {
    console.log("[RPSProvider] Effect running, ID:", mountId.current, "Wallet:", !!solanaWallet);
    const initializeProgram = async () => {
      if (!solanaWallet?.address) {
        console.log("No wallet address found");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("Initializing with wallet address:", solanaWallet.address);
        console.log("Full wallet object:", JSON.stringify(solanaWallet, null, 2));
        console.log("Full IDL:", JSON.stringify(IDL, null, 2));
        
        const connection = new Connection(DEVNET_ENDPOINT);
        
        // Validate wallet address
        if (typeof solanaWallet.address !== 'string') {
          throw new Error(`Invalid wallet address type: ${typeof solanaWallet.address}`);
        }

        // Create and validate public key
        let publicKey: PublicKey;
        try {
          publicKey = new PublicKey(solanaWallet.address);
          console.log("PublicKey details:", {
            base58: publicKey.toBase58(),
            bytes: publicKey.toBytes(),
            buffer: publicKey.toBuffer()
          });
        } catch (err) {
          throw new Error(`Failed to create PublicKey: ${err.message}`);
        }

        // Create and validate program ID
        let programId: PublicKey;
        try {
          programId = new PublicKey(PROGRAM_ID);
          console.log("Program ID details:", {
            base58: programId.toBase58(),
            bytes: programId.toBytes(),
            buffer: programId.toBuffer()
          });
        } catch (err) {
          throw new Error(`Failed to create program ID PublicKey: ${err.message}`);
        }

        // Create wallet adapter with detailed logging
        const walletAdapter = {
          publicKey,
          signTransaction: async (tx: any) => {
            console.log("Signing transaction:", tx);
            return solanaWallet.signTransaction(tx);
          },
          signAllTransactions: async (transactions: any[]) => {
            console.log("Signing multiple transactions:", transactions);
            return Promise.all(transactions.map(tx => solanaWallet.signTransaction(tx)));
          },
        };

        console.log("Creating AnchorProvider with config:", {
          connection: DEVNET_ENDPOINT,
          commitment: 'confirmed'
        });
        
        const provider = new anchor.AnchorProvider(
          connection,
          walletAdapter,
          { commitment: 'confirmed' }
        );
        
        console.log("Provider created:", provider);
        anchor.setProvider(provider);

        console.log("Creating Program instance with:", {
          programId: programId.toBase58(),
          provider: provider.constructor.name
        });

        const rpsProgram = new anchor.Program(
          IDL,
          programId,
          provider
        );

        setProgram(rpsProgram);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize RPS program:', err);
        console.error('Error stack:', err.stack);
        setError(err instanceof Error ? err : new Error('Failed to initialize RPS program'));
        setProgram(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeProgram();
  }, [solanaWallet?.address]);

  console.log("[RPSProvider] Rendering, ID:", mountId.current, "Program:", !!program);
  return (
    <RPSContext.Provider value={{ program, isLoading, error }}>
      {children}
    </RPSContext.Provider>
  );
}    
