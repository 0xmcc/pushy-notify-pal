import { supabase } from "@/integrations/supabase/client";
import { Game } from "@/types/game";
import { toast } from "sonner";




export const fetchGamesFromSupabase = async (stakeRange: [number, number], userDid: string | null): Promise<Game[]> => {
  console.log("fetchGamesFromSupabase", stakeRange, userDid);
  // if (!userDid) {
  //   console.error('User did not find');
  //   return [];
  // }
  const { data: matchesData, error: matchesError } = await supabase
  .from('matches')
  .select(`
    *,
    player1:users!matches_player1_did_fkey(
      rating,
      display_name
    ),
    player2:users!matches_player2_did_fkey(
      rating,
      display_name
    )
  `)
  .or(userDid 
    ? `
    status.eq.pending,
      player2_did.is.null,
      stake_amount.gte.${stakeRange[0]},
      stake_amount.lte.${stakeRange[1]},
    or(player1_did.eq.${userDid},and(status.neq.pending,player1_hidden.eq.false)),
    or(player2_did.eq.${userDid},and(status.neq.pending,player2_hidden.eq.false))`
    : `
    status.eq.pending,player2_did.is.null,stake_amount.gte.${stakeRange[0]},stake_amount.lte.${stakeRange[1]}`)
    .order('status', { ascending: true }) // Completed before pending
    .order('player2_move_timestamp', { ascending: false }) // Most recent completed games
    .order('created_at', { ascending: true }); // Oldest pending games first
  
 
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


// .or(`status.eq.pending.and(player2_did.is.null).and(stake_amount.gte.${stakeRange[0]}).and(stake_amount.lte.${stakeRange[1]})`)
  //  .or(`(status.eq.pending)`)
  // .or(
  //   false
  //     ? `(status.eq.pending,player2_did.is.null,stake_amount.gte.${stakeRange[0]},stake_amount.lte.${stakeRange[1]}),(status.neq.pending,player1_did.eq.${userDid},player1_hidden.eq.false),(status.neq.pending,player2_did.eq.${userDid},player2_hidden.eq.false)`
  //     : `(status.eq.pending,player2_did.is.null,stake_amount.gte.${stakeRange[0]},stake_amount.lte.${stakeRange[1]})`
  // )
  // .or(
  //   `
  //       (status.eq.pending,player2_did.is.null,stake_amount.gte.${stakeRange[0]},stake_amount.lte.${stakeRange[1]}),
  //       (status.neq.pending,player1_did.eq.${userDid},player1_hidden.eq.false),
  //       (status.neq.pending,player2_did.eq.${userDid},player2_hidden.eq.false)
  //     `
      
  // )
  