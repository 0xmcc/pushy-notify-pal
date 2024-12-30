import { supabase } from "@/integrations/supabase/client";
import { Game } from "@/types/game";
import { toast } from "sonner";

const determineWinner = (move1: string, move2: string) => {
  // Convert moves to numbers for easier comparison
  const m1 = parseInt(move1);
  const m2 = parseInt(move2);
  
  // 0 = rock, 1 = paper, 2 = scissors
  if (m1 === m2) return null; // Draw
  
  // Rock beats Scissors
  if (m1 === 0 && m2 === 2) return 1;
  if (m1 === 2 && m2 === 0) return 2;
  
  // Higher number wins in all other cases
  return m1 > m2 ? 1 : 2;
};

export const playGameMove = async (gameId: string, move: string, userId: string) => {
  try {
    if (move === 'claim') {
      // Handle claim action
      const { error } = await supabase
        .from('matches')
        .update({ 
          status: 'completed',
          winner_did: userId
        })
        .eq('id', gameId);

      if (error) throw error;
      toast.success('Reward claimed successfully!');
    } else {
      // First, get the game details to check stake amount and current state
      const { data: gameData, error: gameError } = await supabase
        .from('matches')
        .select('*, player1_did, player1_move')
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;

      // Get user's current balance
      const { data: userData, error: balanceError } = await supabase
        .from('users')
        .select('off_chain_balance')
        .eq('did', userId)
        .single();

      if (balanceError) throw balanceError;

      const currentBalance = userData.off_chain_balance || 0;
      const stakeAmount = gameData.stake_amount;

      if (currentBalance < stakeAmount) {
        throw new Error(`Insufficient balance. You need ${stakeAmount} credits to play.`);
      }

      // Update user's balance
      const { error: updateBalanceError } = await supabase
        .from('users')
        .update({ 
          off_chain_balance: currentBalance - stakeAmount 
        })
        .eq('did', userId);

      if (updateBalanceError) throw updateBalanceError;

      // Update the game with the player's move
      const updateData: any = {
        player2_did: userId,
        player2_move: move,
        player2_move_timestamp: new Date().toISOString(),
        status: 'in_progress'
      };

      // If both moves are present, determine the winner
      if (gameData.player1_move) {
        const winner = determineWinner(gameData.player1_move, move);
        if (winner === null) {
          // It's a draw
          updateData.status = 'completed';
        } else {
          // Set winner and loser
          updateData.status = 'completed';
          updateData.winner_did = winner === 1 ? gameData.player1_did : userId;
          updateData.loser_did = winner === 1 ? userId : gameData.player1_did;
        }
      }

      const { error: moveError } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', gameId);

      if (moveError) throw moveError;
      
      toast.success(`Move played successfully!`);
    }
  } catch (error) {
    console.error('Error playing move:', error);
    toast.error(error instanceof Error ? error.message : "Failed to play move");
    throw error;
  }
};

// Mock data for development and testing
export const mockGames: Game[] = [
  {
    id: 'mock-1',
    player1_did: 'CryptoNinja',
    player2_did: null,
    stake_amount: 50,
    status: 'pending',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '0', // rock
    player2_move: null,
    creator_name: 'CryptoNinja',
    creator_rating: 1850
  },
  {
    id: 'mock-2',
    player1_did: 'Web3Warrior',
    player2_did: 'BlockMaster',
    stake_amount: 100,
    status: 'in_progress',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '1', // paper
    player2_move: '2', // scissors
    creator_name: 'Web3Warrior',
    creator_rating: 1650,
    winner_did: 'BlockMaster'
  },
  {
    id: 'mock-3',
    player1_did: 'ChainChampion',
    player2_did: null,
    stake_amount: 250,
    status: 'pending',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '2', // scissors
    player2_move: null,
    creator_name: 'ChainChampion',
    creator_rating: 2100
  },
  {
    id: 'mock-4',
    player1_did: 'TokenTitan',
    player2_did: 'CryptoKing',
    stake_amount: 500,
    status: 'completed',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '0', // rock
    player2_move: '2', // scissors
    creator_name: 'TokenTitan',
    creator_rating: 1920,
    winner_did: 'TokenTitan'
  },
  {
    id: 'mock-5',
    player1_did: 'MetaMaster',
    player2_did: null,
    stake_amount: 1000,
    status: 'pending',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '1', // paper
    player2_move: null,
    creator_name: 'MetaMaster',
    creator_rating: 2250
  },
  {
    id: 'mock-6',
    player1_did: 'ByteBoss',
    player2_did: 'HashHero',
    stake_amount: 750,
    status: 'in_progress',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '2', // scissors
    player2_move: '1', // paper
    creator_name: 'ByteBoss',
    creator_rating: 1750,
    winner_did: 'ByteBoss'
  }
];
