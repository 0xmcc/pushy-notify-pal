'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LeaderboardList } from '@/components/leaderboard/LeaderboardList';

interface LeaderboardUser {
  did: string;
  display_name: string | null;
  avatar_url: string | null;
  rating: number;
}

const HomePage = () => {
  const { authenticated, user } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    const checkProfile = async () => {
      if (authenticated && user) {
        try {
          const { error } = await supabase
            .from('users')
            .select('display_name, avatar_url')
            .eq('did', user.id)
            .maybeSingle();

          if (error) {
            console.error('Error checking profile:', error);
            toast.error('Failed to load profile');
          }
        } catch (error) {
          console.error('Error in checkProfile:', error);
          toast.error('Failed to load profile');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [authenticated, user]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('did, display_name, avatar_url, rating')
          .order('rating', { ascending: false })
          .limit(5);

        if (error) throw error;
        setLeaderboardUsers(data || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast.error('Failed to load leaderboard');
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gaming-background flex items-center justify-center">
        <div className="animate-pulse text-gaming-text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gaming-background via-gaming-background/95 to-gaming-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.1),rgba(139,92,246,0.05))] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <LeaderboardList users={leaderboardUsers} />
      </div>
    </div>
  );
};

export default HomePage;