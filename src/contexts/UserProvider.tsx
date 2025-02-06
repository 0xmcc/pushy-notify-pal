import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';

interface UserStats {
  off_chain_balance: number;
  rock_count: number;
  paper_count: number;
  scissors_count: number;
  rating: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  matches_drawn: number;
}

interface UserContextProps {
  userStats: UserStats | null;
  isLoading: boolean;
  error: Error | null;
}

const DEFAULT_USER_STATS: UserStats = {
  off_chain_balance: 0,
  rock_count: 0,
  paper_count: 0,
  scissors_count: 0,
  rating: 1200,
  matches_played: 0,
  matches_won: 0,
  matches_lost: 0,
  matches_drawn: 0,
};

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, ready } = usePrivy();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ready || !user?.id) {
      setIsLoading(false);
      return;
    }

    // Fetch the initial user data
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('did', user.id)
          .single();
        
        if (error) {
          throw error;
        }

        setUserStats({
          off_chain_balance: userData.off_chain_balance || 0,
          rock_count: userData.rock_count || 0,
          paper_count: userData.paper_count || 0,
          scissors_count: userData.scissors_count || 0,
          rating: userData.rating || 1200,
          matches_played: userData.matches_played || 0,
          matches_won: userData.matches_won || 0,
          matches_lost: userData.matches_lost || 0,
          matches_drawn: userData.matches_drawn || 0,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
        setUserStats(DEFAULT_USER_STATS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Set up a unique subscription channel for this user
    const channel = supabase
      .channel(`user-stats-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `did=eq.${user.id}`
        },
        (payload) => {
          setUserStats(prev => ({
            ...prev,
            ...payload.new,
          }));
        }
      )
      .subscribe();

    // Clean up the subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, ready]);

  return (
    <UserContext.Provider value={{ userStats, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 