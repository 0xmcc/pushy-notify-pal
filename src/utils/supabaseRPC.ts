import { supabase } from "@/integrations/supabase/client";

export const incrementOffChainBalance = async (userId: string, amount: number): Promise<number | null> => {
  const { data, error } = await supabase
    .from('users')
    .update({ 
      off_chain_balance: supabase.rpc('increment', { amount }) 
    })
    .eq('did', userId)
    .select('off_chain_balance')
    .single();
  
  if (error) {
    console.error('Error incrementing off-chain balance:', error);
    return null;
  }

  return data?.off_chain_balance ?? null;
};