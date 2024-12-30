import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from "@/integrations/supabase/client";

interface UserStats {
  off_chain_balance: number;
  matches_won: number;
  matches_lost: number;
}

export const WalletBalance = () => {
  const { user } = usePrivy();
  const [userStats, setUserStats] = useState<UserStats>({
    off_chain_balance: 0,
    matches_won: 0,
    matches_lost: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.id) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('off_chain_balance, matches_won, matches_lost')
          .eq('did', user.id)
          .single();

        if (error) {
          console.error('Error fetching user stats:', error);
        } else {
          setUserStats({
            off_chain_balance: userData.off_chain_balance || 0,
            matches_won: userData.matches_won || 0,
            matches_lost: userData.matches_lost || 0
          });
        }
      }
    };

    // Initial fetch
    fetchStats();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `did=eq.${user?.id}`
        },
        (payload) => {
          console.log('Stats update received:', payload);
          setUserStats({
            off_chain_balance: payload.new.off_chain_balance || 0,
            matches_won: payload.new.matches_won || 0,
            matches_lost: payload.new.matches_lost || 0
          });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (!user?.id) return null;

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-1 text-sm text-gaming-text-primary">
        <span>{userStats.off_chain_balance.toFixed(2)}</span>
        <span className="text-gaming-text-secondary">credits</span>
      </div>
      <div className="text-xs text-gaming-text-secondary">
        {userStats.matches_won}-{userStats.matches_lost}
      </div>
    </div>
  );
};