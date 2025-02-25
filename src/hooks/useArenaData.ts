import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePrivy } from '@privy-io/react-auth';

interface MatchHistory {
  created_at: string;
  winner_did: string;
  status: string;
}

interface ArenaPlayer {
  did: string;
  display_name: string;
  avatar_url: string;
  rating: number;
  games_played: number;
  wins: number;
  losses: number;
  current_streak: number;
  last_game_pending: boolean;
  last_game_timestamp: string;
  match_history: {
    created_at: string;
    winner_did: string;
    status: string;
  }[];
}

export const useArenaData = () => {
  const { user } = usePrivy();

  return useQuery({
    queryKey: ['arena-players'],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID found');
        return [];
      }

      console.log('Fetching arena data for user:', user.id);
      
      // First get all matches involving the current user, sorted by most recent
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`player1_did.eq.${user.id},player2_did.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;

      // Extract unique opponent DIDs in order of most recent match
      const opponentDids = matches
        .map(match => match.player1_did === user.id ? match.player2_did : match.player1_did)
        .filter((did, index, self) => self.indexOf(did) === index);

      // Then get user data for all opponents
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          did,
          display_name,
          avatar_url,
          rating
        `)
        .in('did', opponentDids);

      if (usersError) throw usersError;

      // Create a map for quick user lookup
      const userMap = new Map(users.map(user => [user.did, user]));

      // Process the data to calculate stats, maintaining the order from opponentDids
      const processedData = opponentDids
        .map(did => userMap.get(did))
        .filter(player => player) // Remove any undefined entries
        .map((player): ArenaPlayer => {
          const playerMatches = matches.filter(match => 
            match.player1_did === player.did || 
            match.player2_did === player.did
          );

          // Format match history for this player
          const match_history = playerMatches.map(match => ({
            created_at: match.created_at,
            winner_did: match.winner_did,
            status: match.status
          }));

          return {
            did: player.did,
            display_name: player.display_name,
            avatar_url: player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.did}`,
            rating: player.rating,
            games_played: playerMatches.length,
            wins: playerMatches.filter(match => match.winner_did === player.did).length,
            losses: playerMatches.filter(match => 
              match.status === 'completed' && match.winner_did !== player.did
            ).length,
            current_streak: calculateStreak(playerMatches, player.did),
            last_game_pending: playerMatches[0]?.status === 'pending',
            last_game_timestamp: playerMatches[0]?.created_at || '',
            match_history
          };
        });

      console.log('Processed arena data:', processedData);
      return processedData;
    },
    enabled: !!user?.id,
  });
};

function calculateStreak(games: any[], playerDid: string): number {
  let streak = 0;
  for (const game of games) {
    if (game.winner_did === playerDid) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
} 