'use client';

import { BN } from 'bn.js';
import { Buffer } from 'buffer';
import { createContext, useContext, ReactNode } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { LAMPORTS_PER_SOL, clusterApiUrl, Connection, PublicKey, Transaction } from '@solana/web3.js';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';

import { IDL, RpsGame } from '@/types/rps_game';
import { createWalletAdapter } from '@/utils/walletAdapter';
import { generateSalt, createCommitment } from '@/utils/cryptography';

const PROGRAM_ID = "AdNRN8coBzuAPKiKPz4uxEQrgDDp2ZxXjtXfu6NnYKSg";


export interface RPSContextType {
  createGame: (stakeAmount: number) => Promise<number>;
  initializePlayer: () => Promise<string>;
  deletePlayer: () => Promise<string>;
  commitMove: (gameCreationTimestamp: number, move: number) => Promise<Uint8Array>;
  client: any;
  connected: boolean;
}

const RPSContext = createContext<RPSContextType>({
  createGame: async () => 0,
  initializePlayer: async () => '',
  deletePlayer: async () => '',
  commitMove: async () => new Uint8Array(),
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

  const createGame = async (stakeAmount: number): Promise<number> => {
    if (!user) return;
    const publicKey = new PublicKey(user.wallet?.address || '');

    const program = getProgram();
    if (!program) return;

    const creationTimestamp = new BN(Date.now());
    const [gamePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("game"),
        publicKey.toBuffer(),
        creationTimestamp.toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), gamePda.toBuffer()],
      program.programId
    );

    try {
      const betAmount = new BN(stakeAmount * LAMPORTS_PER_SOL);

      const tx = await program.methods
        .createGame(creationTimestamp, betAmount)
        .accounts({
          playerOne: publicKey,
          gameAccount: gamePda,
          gameVault: vaultPda,
        })
        .rpc({ commitment: "confirmed" });

      console.log("Created game! Transaction signature:", tx);

      // Return creation timestamp.
      // TODO: Store this in supabase(?) for use later.
      return creationTimestamp.toNumber();
    } catch (error) {
      console.error("Error creating game:", error);
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

    const [playerOneVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), publicKey.toBuffer()],
      program.programId
    );

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

  const deletePlayer = async (): Promise<string> => {
    if (!user) return;
    const publicKey = new PublicKey(user.wallet?.address || '');

    const program = getProgram();
    if (!program || !publicKey) return;

    const [playerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("player"), publicKey.toBuffer()],
      program.programId
    );

    const [playerOneVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), publicKey.toBuffer()],
      program.programId
    );

    try {
      const tx = await program.methods
        .deletePlayer()
        .accounts({
          playerAccount: playerPda,
          vault: playerOneVaultPda,
          user: publicKey,
        })
        .rpc({ commitment: "confirmed" });

      console.log("Deleted player! Transaction signature:", tx);

      return tx;
    } catch (error) {
      console.error("Error deleting player: ", error);
      throw error;
    }
  }

  const commitMove = async (gameCreationTimestamp: number, move: number): Promise<Uint8Array> => {
    if (!user) return;
    const publicKey = new PublicKey(user.wallet?.address || '');

    const program = getProgram();
    if (!program) return;

    const gameCreationTimestampBN = new BN(gameCreationTimestamp);
    const [gamePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("game"),
        publicKey.toBuffer(),
        gameCreationTimestampBN.toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    );
    const [gameVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), gamePda.toBuffer()],
      program.programId
    );

    try {
      const playerSalt = generateSalt();
      let commitment = await createCommitment(move, playerSalt);
      const tx = await program.methods
        .commitMove(Array.from(commitment))
        .accounts({
          player: publicKey,
          game: gamePda,
          vault: gameVaultPda,
        })
        .rpc({ commitment: "confirmed" });

      console.log("Committed move! Transaction signature:", tx);

      // Return player salt.
      // TODO: Store this in supabase(?) for use later.
      return playerSalt;
    } catch (error) {
      console.error("Error committing move: ", error);
      throw error;
    }
  }

  const value = {
    createGame,
    initializePlayer,
    deletePlayer,
    commitMove,
    client: getProgram,
    connected: authenticated,
  };

  return <RPSContext.Provider value={value}>{children}</RPSContext.Provider>;
};