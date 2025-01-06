import { supabase } from "@/integrations/supabase/client";
import { Game } from "@/types/game";
import { toast } from "sonner";




export const fetchGamesFromSupabase = async (stakeRange: [number, number], userDid: string | null): Promise<Game[]> => {
  console.log("MCC fetchGamesFromSupabase", stakeRange, userDid);
  if (!userDid) {
    console.log("MCC fetchGamesFromSupabase", stakeRange, userDid);
    return [];
  }


  // Basic pending game conditions
  const isPendingGame = `and(status.eq.pending,player2_did.is.null)`; // This and() is correct, keep it

  // User-specific conditions for pending games
  const userNotPlayer1 = `player1_did.neq.${userDid}`;

  // Stake range conditions for pending games
  const withinStakeRange = `and(stake_amount.gte.${stakeRange[0]},stake_amount.lte.${stakeRange[1]})`; // This and() is correct, keep it

  // Combine pending game conditions
  const pendingGamesFilter = `and(${isPendingGame},${userNotPlayer1},${withinStakeRange})`;

  // Non-pending games with hidden criteria
  const nonPendingBasic = `status.neq.pending`;
  const notHiddenAsPlayer1 = `and(player1_did.eq.${userDid},or(player1_hidden.is.null,player1_hidden.eq.false))`;
  const notHiddenAsPlayer2 = `and(player2_did.eq.${userDid},or(player2_hidden.is.null,player2_hidden.eq.false))`;
  const notHiddenGamesFilter = `or(${notHiddenAsPlayer1},${notHiddenAsPlayer2})`;
  const nonPendingGamesFilter = `and(${nonPendingBasic},${notHiddenGamesFilter})`;

  // Combine filters with simple comma (no extra space)
  const fullFilter = `${pendingGamesFilter},${nonPendingGamesFilter}`; // Changed this line back

  console.log('MCC FULL FILTER:', fullFilter);

  let query = supabase
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
    .or(fullFilter)


  const { data: matchesData, error: matchesError } = await query
    .order('status', { ascending: true })
    .order('player2_move_timestamp', { ascending: false })
    .order('created_at', { ascending: true });
  console.log("MCC matchesData", matchesData);
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
  