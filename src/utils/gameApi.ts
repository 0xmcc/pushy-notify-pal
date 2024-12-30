import { supabase } from "@/integrations/supabase/client";
import { Game } from "@/types/game";
import { toast } from "sonner";

export const fetchGamesFromSupabase = async (stakeRange: [number, number]): Promise<Game[]> => {
  const { data: matchesData, error: matchesError } = await supabase
    .from('matches')
    .select(`
      *,
      player1:users!matches_player1_did_fkey(
        rating,
        display_name
      )
    `)
    .or('status.eq.pending,status.eq.in_progress,status.eq.completed')
    .gte('stake_amount', stakeRange[0])
    .lte('stake_amount', stakeRange[1])
    .order('expiration_date', { ascending: false });

  if (matchesError) throw matchesError;

  return (matchesData || []).map(match => ({
    id: match.id,
    player1_did: match.player1_did,
    player2_did: match.player2_did,
    stake_amount: match.stake_amount,
    status: match.status,
    expiration_date: match.expiration_date,
    player1_move: match.player1_move,
    player2_move: match.player2_move,
    creator_rating: match.player1?.rating,
    creator_name: match.player1?.display_name || match.player1_did,
    winner_did: match.winner_did
  }));
};

export const setupRealtimeSubscription = (
  onUpdate: () => void
) => {
  console.log("Setting up realtime subscription for matches");
  const channel = supabase
    .channel('matches_changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'matches'
      },
      (payload) => {
        console.log("Received realtime update:", payload);
        toast.info("Game updated!");
        onUpdate();
      }
    )
    .subscribe((status) => {
      console.log("Realtime subscription status:", status);
    });

  return channel;
};