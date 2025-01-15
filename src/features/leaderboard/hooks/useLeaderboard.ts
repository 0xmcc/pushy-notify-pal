import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardUser {
  did: string;
  display_name: string;
  matches_won: number;
  matches_lost: number;
  matches_drawn: number;
  total_games?: number;
  win_rate?: number;
  rating: number;
}

export const useLeaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useLeaderboard() LETS GO');
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('did, display_name, matches_won, matches_lost, matches_drawn, rating')
          .order('rating', { ascending: false })
          .limit(10);

        if (error) throw error;
        console.log('useLeaderboard() LETS GO', data);
        // Calculate additional stats for each user
        const enrichedData = (data || []).map(user => {
          const total_games = user.matches_won + user.matches_lost + user.matches_drawn;
          const win_rate = total_games > 0 
            ? Math.round((user.matches_won / total_games) * 100) 
            : 0;



          return {
            ...user,
            total_games,
            win_rate
          };
        });

        setUsers(enrichedData);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();

    // Set up realtime subscription for leaderboard updates
    const channel = supabase
      .channel('leaderboard_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'users',
          filter: 'rating IS NOT NULL'
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { 
    users, 
    isLoading, 
    error,
    topPlayer: users[0],
    totalPlayers: users.length,
  };
}; 