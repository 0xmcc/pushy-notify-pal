'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { IDL } from '@/target/types/rock_paper_scissors';
import { usePrivy } from '@privy-io/react-auth';

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
  const wallet = useWallet();
  const { user } = usePrivy();

  const getProgram = () => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');

    const connection = new Connection('http://localhost:8899', 'confirmed');
    const provider = new AnchorProvider(connection, wallet as any, {
      commitment: 'confirmed',
    });

    return new Program(IDL as Idl, new PublicKey('RPS1111111111111111111111111111111111111111'), provider);
  };

  const createGame = async (stakeAmount: number): Promise<string> => {
    try {
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
    try {
      const program = getProgram();
      const tx = new Transaction();
      // Add player initialization instruction
      const signature = await wallet.sendTransaction(tx, program.provider.connection);
      return signature;
    } catch (error) {
      console.error('Error initializing player:', error);
      throw error;
    }
  };

  const value = {
    createGame,
    initializePlayer,
    client: getProgram,
    connected: !!wallet.publicKey && !!user,
  };

  return <RPSContext.Provider value={value}>{children}</RPSContext.Provider>;
};