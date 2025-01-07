import { supabase } from "@/integrations/supabase/client";

export const playMove = async (gameId: string, move: string) => {
  const { data, error } = await supabase
    .from('matches')
    .update({ player2_move: move, player2_move_timestamp: new Date().toISOString() })
    .eq('id', gameId)
    .select()
    .single();

  if (error) throw error;
  return data;
};