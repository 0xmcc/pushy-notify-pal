// RPSProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { clusterApiUrl, PublicKey, Connection } from '@solana/web3.js';
import { Buffer } from 'buffer';
import * as anchor from '@coral-xyz/anchor';
import { IDL, RpsGame } from '@/types/rps_game';
import { createWalletAdapter } from '@/utils/wallet-adapter';

// Move conversion type
export enum SolanaMove {
  Rock = 0,
  Paper = 1,
  Scissors = 2
}
// Ensure Buffer is available globally
if (!window.Buffer) {
  window.Buffer = Buffer;
}

const PROGRAM_ID = "AdNRN8coBzuAPKiKPz4uxEQrgDDp2ZxXjtXfu6NnYKSg"; // Replace with your deployed program ID

// Update context interface to include game creation
interface RPSContextProps {
  program: anchor.Program<RpsGame> | null; // The Anchor program instance or null if not initialized
  isLoading: boolean;                      // Loading state during program initialization
  error: Error | null;                     // Any error encountered during initialization
  createGameAndCommitMove: (betAmount: number, moveNumber: number) => Promise<{ gameAccount: PublicKey, commitment: number[] } | null>;
}

const RPSContext = createContext<RPSContextProps | undefined>(undefined);

export const RPSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = usePrivy();
  const { wallets } = useSolanaWallets();
  const connection = new Connection(clusterApiUrl('devnet'));

  const [program, setProgram] = useState<anchor.Program<RpsGame> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initProgram = async () => {
      console.log("[RPSProvider] Initializing program", { 
        hasUser: !!user, 
        hasWallets: !!wallets?.length 
      });
      setIsLoading(true);

      // Only attempt initialization if a user and at least one wallet exist
      if (!user || !wallets || wallets.length === 0) {
        console.log("[RPSProvider] No user or wallets");
        setProgram(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log("[RPSProvider] Creating wallet adapter");
        const walletAdapter = createWalletAdapter(wallets[0]);
        console.log("[RPSProvider] Creating provider");
        const provider = new anchor.AnchorProvider<RpsGame>(
          connection,
          walletAdapter,
          { commitment: 'processed' }
        );
        anchor.setProvider(provider);
        const programId = new PublicKey(PROGRAM_ID);
        console.log("[RPSProvider] Setting provider", { provider, programId, PROGRAM_ID });
        const prog = new anchor.Program(IDL, programId, provider);
        console.log("[RPSProvider] Program initialized", prog);
        setProgram(prog);
        setError(null);
      } catch (err) {
        console.error("[RPSProvider] Error initializing program:", err);
        setError(err instanceof Error ? err : new Error('Failed to initialize program'));
        setProgram(null);
      }
      setIsLoading(false);
    };

    initProgram();
  }, [user, wallets]);

  const createGameAndCommitMove = async (
    betAmount: number,
    moveNumber: number
  ): Promise<{ gameAccount: PublicKey, commitment: number[] } | null> => {
    if (!program) {
      console.error("[RPSProvider] Program not initialized");
      return null;
    }

    try {
      const wallet = program.provider.publicKey;

      // Generate PDAs
      const [gameAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("game"), wallet.toBuffer()],
        program.programId
      );

      const [gameVault] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), gameAccount.toBuffer()],
        program.programId
      );

      // Generate move commitment
      const salt = Array.from(crypto.getRandomValues(new Uint8Array(32)));
      const move = convertMoveNumberToSolanaMove(moveNumber);
      const commitment = generateMoveCommitment(move, salt);

      // Create game
      await program.methods
        .createGame(
          new anchor.BN(Date.now()),
          new anchor.BN(betAmount)
        )
        .accounts({
          playerOne: wallet,
          gameAccount: gameAccount,
          gameVault: gameVault,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Commit move
      await program.methods
        .commitMove(commitment)
        .accounts({
          player: wallet,
          game: gameAccount,
          vault: gameVault,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      return { gameAccount, commitment };
    } catch (error) {
      console.error("[RPSProvider] Failed to create game and commit move:", error);
      throw error;
    }
  };

  return (
    <RPSContext.Provider value={{ 
      program, 
      isLoading, 
      error,
      createGameAndCommitMove 
    }}>
      {children}
    </RPSContext.Provider>
  );
};

// Helper functions
const convertMoveNumberToSolanaMove = (moveNumber: number): SolanaMove => {
  switch (moveNumber) {
    case 0:
      return SolanaMove.Rock;
    case 1:
      return SolanaMove.Paper;
    case 2:
      return SolanaMove.Scissors;
    default:
      throw new Error('Invalid move number');
  }
};

const generateMoveCommitment = (move: SolanaMove, salt: number[]): number[] => {
  return [move, ...salt];
};

export const useRPS = () => {
  const context = useContext(RPSContext);
  if (!context) {
    throw new Error("useRPS must be used within a RPSProvider");
  }
  return context;
};
