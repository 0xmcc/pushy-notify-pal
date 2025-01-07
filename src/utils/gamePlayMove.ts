import { supabase } from '@/integrations/supabase/client';
import { createGameNotification } from './pushNotifications';

export const playMove = async (gameId: string, userId: string, move: string) => {
  try {
    // Get the game details first
    const { data: game, error: gameError } = await supabase
      .from('active_games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError) throw gameError;

    // Update the game with the player's move
    const { data, error } = await supabase
      .from('active_games')
      .update({ selected_move: move })
      .eq('id', gameId)
      .select()
      .single();

    if (error) throw error;

    // Send notification to opponent
    const opponentId = game.creator_did === userId ? game.opponent_did : game.creator_did;
    if (opponentId) {
      await createGameNotification(
        opponentId,
        `Your opponent has made their move in game ${gameId.slice(0, 8)}...`
      );
    }

    return data;
  } catch (error) {
    console.error('Error playing move:', error);
    throw error;
  }
};

export const resolveGame = async (gameId: string, winnerId: string | null) => {
  try {
    const { data: game, error: gameError } = await supabase
      .from('active_games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError) throw gameError;

    // Update game status and winner
    const { data, error } = await supabase
      .from('active_games')
      .update({
        status: 'completed',
        winner_did: winnerId
      })
      .eq('id', gameId)
      .select()
      .single();

    if (error) throw error;

    // Send notifications to both players
    const notificationPromises = [];
    if (winnerId) {
      // Notify winner
      notificationPromises.push(
        createGameNotification(
          winnerId,
          `Congratulations! You won game ${gameId.slice(0, 8)}...`
        )
      );
      
      // Notify loser
      const loserId = game.creator_did === winnerId ? game.opponent_did : game.creator_did;
      if (loserId) {
        notificationPromises.push(
          createGameNotification(
            loserId,
            `Game Over. You lost game ${gameId.slice(0, 8)}...`
          )
        );
      }
    } else {
      // It's a draw - notify both players
      notificationPromises.push(
        createGameNotification(
          game.creator_did,
          `Game ${gameId.slice(0, 8)}... ended in a draw!`
        ),
        createGameNotification(
          game.opponent_did,
          `Game ${gameId.slice(0, 8)}... ended in a draw!`
        )
      );
    }

    await Promise.all(notificationPromises);

    return data;
  } catch (error) {
    console.error('Error resolving game:', error);
    throw error;
  }
};