import { supabase } from "@/integrations/supabase/client";

export const incrementOffChainBalance = async (userId: string, amount: number): Promise<number | null> => {
  try {
    // First, get the current balance
    const { data: currentData, error: fetchError } = await supabase
      .from('users')
      .select('off_chain_balance')
      .eq('did', userId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current balance:', fetchError);
      return null;
    }

    const currentBalance = currentData.off_chain_balance || 0;
    const newBalance = currentBalance + amount;

    // Then update with the new balance
    const { data, error } = await supabase
      .from('users')
      .update({ off_chain_balance: newBalance })
      .eq('did', userId)
      .select('off_chain_balance')
      .single();
    
    if (error) {
      console.error('Error incrementing off-chain balance:', error);
      return null;
    }

    return data?.off_chain_balance ?? null;
  } catch (error) {
    console.error('Unexpected error in incrementOffChainBalance:', error);
    return null;
  }
};