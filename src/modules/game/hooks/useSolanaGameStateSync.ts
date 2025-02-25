import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

type GameMove = {
  rock?: boolean;
  paper?: boolean;
  scissors?: boolean;
};

type GameState = {
  playerOne: { toString: () => string };
  playerTwo?: { toString: () => string };
  playerOneMove?: GameMove;
  playerTwoMove?: GameMove;
  playerOneCommitment?: string;
  playerTwoCommitment?: string;
  state: { active: boolean };
  betAmount: number;
  winner?: string;
};

type SaltData = {
  playerNumber: 1 | 2;
  moveNumber: string;
  salt: Uint8Array;
  walletAddress: string;
};

const getMoveString = (move?: GameMove): string | null => {
  if (!move) return null;
  if (move.rock) return '0';
  if (move.paper) return '1';
  if (move.scissors) return '2';
  return null;
};

export const syncGameToSupabase = async (
  gameState: GameState, 
  gamePublicKey: string,
  saltData?: SaltData
) => {
  if (!gameState || !gamePublicKey) return;

  const baseGameData = {
    game_account_address: gamePublicKey,
    player1_wallet_address: gameState.playerOne.toString(),
    player2_wallet_address: gameState.playerTwo?.toString() || null,
    player1_move: getMoveString(gameState.playerOneMove),
    player2_move: getMoveString(gameState.playerTwoMove),
    status: gameState.state.active ? 'active' : 'completed',
    bet_amount: Number(gameState.betAmount) / LAMPORTS_PER_SOL,
    winner_wallet_address: gameState.winner || null,
  };

  // Only add salt data if provided
  const saltUpdates = saltData ? {
    [`player${saltData.playerNumber}_move`]: saltData.moveNumber,
    [`player${saltData.playerNumber}_move_salt`]: Buffer.from(saltData.salt).toString('base64')
  } : {};

  const { error } = await supabase
    .from('solana_matches')
    .upsert({
      ...baseGameData,
      ...saltUpdates
    }, {
      onConflict: 'game_account_address'
    });

  if (error) {
    console.error('Error syncing game to Supabase:', error);
    throw error;
  }
};

export const useSolanaGameStateSync = (gameState: GameState, gamePublicKey: string) => {
  useEffect(() => {
    syncGameToSupabase(gameState, gamePublicKey);
  }, [gameState, gamePublicKey]);
}; 