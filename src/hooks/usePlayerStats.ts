import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';

export interface PlayerStats {
  rating: number;
  rock_count: number;
  paper_count: number;
  scissors_count: number;
  inventory?: {
    rock: number;
    paper: number;
    scissors: number;
  };
}

export const usePlayerStats = (userId?: string) => {
  const { user } = usePrivy();
  const [stats, setStats] = useState<PlayerStats>({
    rating: 1200,
    rock_count: 3,
    paper_count: 3,
    scissors_count: 3,
    inventory: {
      rock: 3,
      paper: 3,
      scissors: 3
    }
  });

  useEffect(() => {
    const fetchStats = async () => {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return;

      const { data, error } = await supabase
        .from('users')
        .select('rating, rock_count, paper_count, scissors_count')
        .eq('did', targetUserId)
        .single();

      if (error) {
        console.error('Error fetching player stats:', error);
        return;
      }

      if (data) {
        setStats({
          ...data,
          inventory: {
            rock: data.rock_count,
            paper: data.paper_count,
            scissors: data.scissors_count
          }
        });
      }
    };

    fetchStats();

    // Set up real-time subscription for stats updates
    const channel = supabase
      .channel('user-stats')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `did=eq.${userId || user?.id}`
        },
        (payload) => {
          console.log('Stats update received:', payload);
          if (payload.new) {
            setStats({
              rating: payload.new.rating,
              rock_count: payload.new.rock_count,
              paper_count: payload.new.paper_count,
              scissors_count: payload.new.scissors_count,
              inventory: {
                rock: payload.new.rock_count,
                paper: payload.new.paper_count,
                scissors: payload.new.scissors_count
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, userId]);

  return stats;
};