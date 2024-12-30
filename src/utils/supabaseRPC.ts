import { supabase } from "@/integrations/supabase/client";

export const incrementOffChainBalance = async (userId: string, amount: number) => {
  const { data, error } = await supabase.rpc('increment_off_chain_balance', {
    user_id: userId,
    increment_amount: amount
  });
  
  if (error) throw error;
  return data;
};