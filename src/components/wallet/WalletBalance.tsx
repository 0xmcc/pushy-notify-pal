import { useEffect, useState } from 'react';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from "@/integrations/supabase/client";

interface UserStats {
  matches_won: number;
  matches_lost: number;
  rating: number;
}

export const WalletBalance = () => {
  const { user } = usePrivy();
  const { tokenBalance } = useTokenBalance();
  const [userStats, setUserStats] = useState<UserStats>({
    matches_won: 0,
    matches_lost: 0,
    rating: 1200
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.id) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('matches_won, matches_lost, rating')
          .eq('did', user.id)
          .single();

        if (error) {
          console.error('Error fetching user stats:', error);
        } else {
          setUserStats({
            matches_won: userData.matches_won || 0,
            matches_lost: userData.matches_lost || 0,
            rating: userData.rating || 1200
          });
        }
      }
    };

    // Initial fetch
    fetchStats();

    // Set up real-time subscription for stats only
    const channel = supabase
      .channel('stats-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `did=eq.${user?.id}`
        },
        (payload) => {
          setUserStats({
            matches_won: payload.new.matches_won || 0,
            matches_lost: payload.new.matches_lost || 0,
            rating: payload.new.rating || 1200
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (!user?.id) return null;

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-1 text-sm text-gaming-text-primary">
        <span>{tokenBalance.toFixed(2)}</span>
        <span className="text-gaming-text-secondary">credits</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gaming-text-secondary">
        <span>{userStats.rating} ELO</span>
        <span className="text-gaming-text-secondary">•</span>
        <span>{userStats.matches_won}-{userStats.matches_lost}</span>
      </div>
    </div>
  );
};