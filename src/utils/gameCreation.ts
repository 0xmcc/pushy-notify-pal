import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const moveToNumber = (move: string): string => {
  switch (move) {
    case 'rock': return '0';
    case 'paper': return '1';
    case 'scissors': return '2';
    default: return '0';
  }
};

interface CreateGameParams {
  userId: string;
  selectedMove: string;
  stakeAmount: string;
}

export const createGame = async ({ userId, selectedMove, stakeAmount }: CreateGameParams) => {
  // Check user's balance
  const { data: userData, error: balanceError } = await supabase
    .from('users')
    .select('off_chain_balance')
    .eq('did', userId)
    .single();

  if (balanceError) throw balanceError;

  const currentBalance = userData.off_chain_balance || 0;
  const stakeValue = Number(stakeAmount);

  if (currentBalance < stakeValue) {
    throw new Error(`Insufficient balance. You have ${currentBalance} credits`);
  }

  // Update user's balance
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      off_chain_balance: currentBalance - stakeValue 
    })
    .eq('did', userId);

  if (updateError) throw updateError;

  // Create the match
  const { error: matchError } = await supabase
    .from('matches')
    .insert({
      player1_did: userId,
      player1_move: moveToNumber(selectedMove),
      player1_move_timestamp: new Date().toISOString(),
      stake_amount: stakeValue,
      status: 'pending'
    });

  if (matchError) throw matchError;
};