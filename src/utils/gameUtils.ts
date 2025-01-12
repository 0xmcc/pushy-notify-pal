import { supabase } from "@/integrations/supabase/client";
import { Game } from "@/types/game";
import { toast } from "sonner";

import { sendSimplePushNotification } from '@/features/notifications/services/gameNotifications';

interface UserInventory {
  off_chain_balance: number;
  rock_count: number;
  paper_count: number;
  scissors_count: number;
}

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

const getMoveInventoryColumn = (move: string): string => {
  switch (move) {
    case '0': return 'rock_count';
    case '1': return 'paper_count';
    case '2': return 'scissors_count';
    default: throw new Error('Invalid move');
  }
};

export const playGameMove = async (gameId: string, move: string, userId: string) => {
  try {
    // First, check if user has the move in inventory
    const { data: userData, error: inventoryError } = await supabase
      .from('users')
      .select('off_chain_balance, rock_count, paper_count, scissors_count')
      .eq('did', userId)
      .single();

    if (inventoryError) throw inventoryError;

    const inventory = userData as UserInventory;
    const inventoryColumn = getMoveInventoryColumn(move);
    
    if (!inventory || inventory[inventoryColumn as keyof UserInventory] <= 0) {
      throw new Error(`You don't have any more of this move available!`);
    }

    // Get the game details to check stake amount and current state
    const { data: gameData, error: gameError } = await supabase
      .from('matches')
      .select('*, player1_did, player1_move')
      .eq('id', gameId)
      .single();

    console.log('gameData', gameData);
    if (gameError) throw gameError;

    const currentBalance = inventory.off_chain_balance || 0;
    const stakeAmount = gameData.stake_amount;

    if (currentBalance < stakeAmount) {
      throw new Error(`Insufficient balance. You need ${stakeAmount} credits to play.`);
    }

    // Update user's balance and inventory
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ 
        off_chain_balance: currentBalance - stakeAmount,
        [inventoryColumn]: inventory[inventoryColumn as keyof UserInventory] - 1
      })
      .eq('did', userId);

    if (updateUserError) throw updateUserError;

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
        updateData.status = 'completed';
      } else {
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

    // If this is player 2 making a move, notify the creator (player1)
    if (userId !== gameData.player1_did) {
      console.log('NOTIF2 Sending push notification to player1');
      await sendSimplePushNotification(
        gameData.player1_did,
        gameId,
        "Your Turn!",
        "Your opponent made a move",
        `/game/${gameId}`
      );
    }

    // If game is complete after this move
    if (gameData.player1_move && gameData.player2_move) {
      // Determine winner and send appropriate notifications
      const winner = determineWinner(gameData.player1_move, gameData.player2_move);
      if (winner) {
        const winnerDid = winner === 1 ? gameData.player1_did : gameData.player2_did;
        const loserDid = winner === 1 ? gameData.player2_did : gameData.player1_did;

        // Notify winner
        await sendSimplePushNotification(
          winnerDid,
          "Congratulations!",
          "You won the game!",
          `/game/${gameId}`
        );
      }
    }
  } catch (error) {
    console.error('Error playing move:', error);
    toast.error(error instanceof Error ? error.message : "Failed to play move");
    throw error;
  }
};

export const hideGame = async (gameId: string, userId: string) => {
  try {
    // Get the current game state
    const { data: game, error: gameError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError) throw gameError;

    // Determine which player is hiding
    const isPlayer1 = userId === game.player1_did;
    const isPlayer2 = userId === game.player2_did;
    const updateField = isPlayer1 ? 'player1_hidden' : isPlayer2 ? 'player2_hidden' : null;

    if (!updateField) {
      throw new Error('User is not a player in this game');
    }

    // Update the hidden status
    const { error: hideError } = await supabase
      .from('matches')
      .update({ [updateField]: true })
      .eq('id', gameId);

    if (hideError) throw hideError;
    
    toast.success('Game hidden successfully');
  } catch (error) {
    console.error('Error hiding game:', error);
    toast.error(error instanceof Error ? error.message : "Failed to hide game");
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
