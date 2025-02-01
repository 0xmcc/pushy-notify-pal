import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePrivy } from '@privy-io/react-auth';

interface ArenaPlayer {
  did: string;
  display_name: string;
  avatar_url: string;
  rating: number;
  games_played: number;
  wins: number;
  current_streak: number;
  last_game_pending: boolean;
  last_game_timestamp: string;
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
      
      // First get all users except current user
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          did,
          display_name,
          avatar_url,
          rating
        `)
        .neq('did', user.id);

      if (usersError) throw usersError;

      // Then get all matches involving the current user
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`player1_did.eq.${user.id},player2_did.eq.${user.id}`);

      if (matchesError) throw matchesError;

      // Process the data to calculate stats
      const processedData = users.map((player): ArenaPlayer => {
        const playerMatches = matches.filter(match => 
          match.player1_did === player.did || 
          match.player2_did === player.did
        ).sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const wins = playerMatches.filter(match => 
          match.winner_did === player.did
        ).length;

        const lastGame = playerMatches[0];
        
        return {
          did: player.did,
          display_name: player.display_name,
          avatar_url: player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.did}`,
          rating: player.rating,
          games_played: playerMatches.length,
          wins,
          current_streak: calculateStreak(playerMatches, player.did),
          last_game_pending: lastGame?.status === 'pending',
          last_game_timestamp: lastGame?.created_at || '',
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