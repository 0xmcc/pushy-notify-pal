import { type Database } from "@/integrations/supabase/types";
import { type RpsGame } from '@/types/rps_game';
import { PublicKey } from '@solana/web3.js';

export interface GameStake {
  userId: string;
  stakeAmount: string;
}

export interface GameMove {
  userId: string;
  selectedMove: string;
}

export interface NotificationOptions {
  title: string;
  body: string;
}

// Solana specific types
export type TransactionInfo = {
  type: 'create_game' | 'join_game' | 'commit_move' | 'reveal_move';
  signature: string;
  timestamp: number;
  gameAccount?: string;
};

export interface SolanaGameState {
  gameAccount: PublicKey;
  playerOne: PublicKey;
  betAmount: number;
  commitment?: number[];
  transactions: TransactionInfo[];
}


// Database types
export type GameMatch = Database['public']['Tables']['matches']['Row'];
export type UserData = Database['public']['Tables']['users']['Row']; 