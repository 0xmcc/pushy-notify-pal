import { supabase } from "@/integrations/supabase/client";
import { GameStake, GameMove } from "../types";

export const moveToNumber = (move: string): string => {
  switch (move.toLowerCase()) {
    case 'rock': return '0';
    case 'paper': return '1';
    case 'scissors': return '2';
    case '0': return '0';
    case '1': return '1';
    case '2': return '2';
    default: return '-1';
  }
};

export const validateAndDeductStake = async ({ userId, stakeAmount }: GameStake) => {
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

  const { error: updateError } = await supabase
    .from('users')
    .update({ off_chain_balance: currentBalance - stakeValue })
    .eq('did', userId);

  if (updateError) throw updateError;
  
  return stakeValue;
};

export const validateAndDeductMove = async ({ userId, selectedMove }: GameMove) => {
  const inventoryColumn = moveToInventoryColumn(selectedMove);
  
  const { data: userData, error: checkError } = await supabase
    .from('users')
    .select(inventoryColumn)
    .eq('did', userId)
    .single();

  if (checkError) throw checkError;
  
  if (!userData || userData[inventoryColumn] <= 0) {
    throw new Error(`You don't have any more of this move available!`);
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ [inventoryColumn]: userData[inventoryColumn] - 1 })
    .eq('did', userId);

  if (updateError) throw updateError;

  return selectedMove;
};

const moveToInventoryColumn = (move: string): string => {
  switch (move) {
    case '0': return 'rock_count';
    case '1': return 'paper_count';
    case '2': return 'scissors_count';
    default: throw new Error('Invalid move');
  }
};

export const createMatch = async (userId: string, selectedMove: string, stakeValue: number) => {
  const { error: matchError } = await supabase
    .from('matches')
    .insert({
      player1_did: userId,
      player1_move: selectedMove,
      player1_move_timestamp: new Date().toISOString(),
      stake_amount: stakeValue,
      status: 'pending'
    });

  if (matchError) throw matchError;
}; 