import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateEloChange } from "./eloCalculator";
import { sendPushNotification, createGameNotification } from "./pushNotifications";

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
      const isPlayer2 = userId === game.player2_did;
      const updateField = isPlayer1 ? 'player1_claimed_at' : isPlayer2 ? 'player2_claimed_at' : null;
      const updateField2 = isPlayer1 ? 'player1_hidden' : isPlayer2 ? 'player2_hidden' : null;
      if (!updateField) throw new Error('User is not a player in this game');

      // Check if already claimed
      if ((isPlayer1 && game.player1_claimed_at) || (isPlayer2 && game.player2_claimed_at)) {
        throw new Error('Reward already claimed');
      }
      
      console.log("updateField", updateField);
      console.log("updateField2", updateField2);
      // Update the claim timestamp
      const { error: claimError } = await supabase
        .from('matches')
        .update({ 
          [updateField]: new Date().toISOString(),
          status: 'completed',
          [updateField2]: true
        })
        .eq('id', gameId);

      if (claimError) throw claimError;
      
      toast.success('Reward claimed successfully!');
    } else {
      // Get game details with proper user ratings
      const { data: gameData, error: gameError } = await supabase
        .from('matches')
        .select(`
          *,
          player1:users!matches_player1_did_fkey(rating, display_name),
          player2:users!matches_player2_did_fkey(rating, display_name)
        `)
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;

      // Get current user's data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('rating, off_chain_balance, rock_count, paper_count, scissors_count, display_name')
        .eq('did', userId)
        .single();

      if (userError) throw userError;

      const currentBalance = userData.off_chain_balance || 0;
      const stakeAmount = gameData.stake_amount;

      if (currentBalance < stakeAmount) {
        throw new Error(`Insufficient balance. You need ${stakeAmount} credits to play.`);
      }

      // Check inventory
      const inventoryColumn = getMoveInventoryColumn(move);
      if (!userData || userData[inventoryColumn] <= 0) {
        throw new Error(`You don't have any more of this move available!`);
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

      // Send notification to the opponent (player1)
      await sendPushNotification(
        gameData.player1_did,
        createGameNotification(
          gameId,
          userData.display_name,
          'move'
        )
      );

      // If both moves are present, determine winner and calculate ELO changes
      if (gameData.player1_move) {
        const winner = determineWinner(gameData.player1_move, move);
        
        if (winner === null) {
          updateData.status = 'completed';
          
          // Send draw notifications
          await Promise.all([
            sendPushNotification(
              gameData.player1_did,
              createGameNotification(gameId, userData.display_name, 'draw')
            ),
            sendPushNotification(
              userId,
              createGameNotification(gameId, gameData.player1.display_name, 'draw')
            )
          ]);
        } else {
          const winnerId = winner === 1 ? gameData.player1_did : userId;
          const loserId = winner === 1 ? userId : gameData.player1_did;
          const winnerName = winner === 1 ? gameData.player1.display_name : userData.display_name;
          const loserName = winner === 1 ? userData.display_name : gameData.player1.display_name;
          
          const winnerRating = winner === 1 ? gameData.player1.rating : userData.rating;
          const loserRating = winner === 1 ? userData.rating : gameData.player1.rating;
          
          const ratingChange = calculateEloChange(winnerRating, loserRating);
          
          updateData.status = 'completed';
          updateData.winner_did = winnerId;
          updateData.loser_did = loserId;
          updateData.winner_rating_change = ratingChange;
          updateData.loser_rating_change = -ratingChange;

          // Send game result notifications
          await Promise.all([
            sendPushNotification(
              winnerId,
              createGameNotification(gameId, loserName, 'win')
            ),
            sendPushNotification(
              loserId,
              createGameNotification(gameId, winnerName, 'lose')
            )
          ]);
          
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
