import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateEloChange } from "./eloCalculator";

const getMoveInventoryColumn = (move: string): string => {
  switch (move) {
    case '0': return 'rock_count';
    case '1': return 'paper_count';
    case '2': return 'scissors_count';
    default: throw new Error('Invalid move');
  }
};

const determineWinner = (move1: string, move2: string) => {
  const m1 = parseInt(move1);
  const m2 = parseInt(move2);
  
  if (m1 === m2) return null;
  if (m1 === 0 && m2 === 2) return 1;
  if (m1 === 2 && m2 === 0) return 2;
  
  return m1 > m2 ? 1 : 2;
};

export const playGameMove = async (gameId: string, move: string, userId: string) => {
  try {
    if (move === 'claim') {
      // Get the current game state
      const { data: game, error: gameError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;

      // Determine which player is claiming
      const isPlayer1 = userId === game.player1_did;
      const updateField = isPlayer1 ? 'player1_claimed_at' : 'player2_claimed_at';

      // Check if already claimed
      if ((isPlayer1 && game.player1_claimed_at) || (!isPlayer1 && game.player2_claimed_at)) {
        throw new Error('Reward already claimed');
      }

      // Update the claim timestamp
      const { error: claimError } = await supabase
        .from('matches')
        .update({ 
          [updateField]: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', gameId);

      if (claimError) throw claimError;
      
      toast.success('Reward claimed successfully!');
    } else {
      // Check inventory
      const { data: userData, error: inventoryError } = await supabase
        .from('users')
        .select('off_chain_balance, rock_count, paper_count, scissors_count, rating')
        .eq('did', userId)
        .single();

      if (inventoryError) throw inventoryError;

      const inventoryColumn = getMoveInventoryColumn(move);
      if (!userData || userData[inventoryColumn] <= 0) {
        throw new Error(`You don't have any more of this move available!`);
      }

      // Get game details
      const { data: gameData, error: gameError } = await supabase
        .from('matches')
        .select(`
          *,
          player1:player1_did(rating),
          player2:player2_did(rating)
        `)
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;

      const currentBalance = userData.off_chain_balance || 0;
      const stakeAmount = gameData.stake_amount;

      if (currentBalance < stakeAmount) {
        throw new Error(`Insufficient balance. You need ${stakeAmount} credits to play.`);
      }

      // Update user's balance and inventory
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ 
          off_chain_balance: currentBalance - stakeAmount,
          [inventoryColumn]: userData[inventoryColumn] - 1
        })
        .eq('did', userId);

      if (updateUserError) throw updateUserError;

      // Update game with player's move
      const updateData: any = {
        player2_did: userId,
        player2_move: move,
        player2_move_timestamp: new Date().toISOString(),
        status: 'in_progress'
      };

      // If both moves are present, determine winner and calculate ELO changes
      if (gameData.player1_move) {
        const winner = determineWinner(gameData.player1_move, move);
        
        if (winner === null) {
          updateData.status = 'completed';
        } else {
          const winnerId = winner === 1 ? gameData.player1_did : userId;
          const loserId = winner === 1 ? userId : gameData.player1_did;
          const winnerRating = winner === 1 ? gameData.player1.rating : userData.rating;
          const loserRating = winner === 1 ? userData.rating : gameData.player1.rating;
          
          const ratingChange = calculateEloChange(winnerRating, loserRating);
          
          updateData.status = 'completed';
          updateData.winner_did = winnerId;
          updateData.loser_did = loserId;
          updateData.winner_rating_change = ratingChange;
          updateData.loser_rating_change = -ratingChange;
          
          // Update ratings immediately
          await supabase
            .from('users')
            .update({ rating: winnerRating + ratingChange })
            .eq('did', winnerId);
            
          await supabase
            .from('users')
            .update({ rating: loserRating - ratingChange })
            .eq('did', loserId);
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
