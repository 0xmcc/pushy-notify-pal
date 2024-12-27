'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trophy, Swords } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import WalletSection from '@/components/WalletSection';
import NotificationSection from '@/components/NotificationSection';
import OnboardingFlow from '@/components/OnboardingFlow';

interface LeaderboardUser {
  did: string;
  display_name: string | null;
  avatar_url: string | null;
  rating: number;
}

const HomePage = () => {
  const { authenticated, user } = usePrivy();
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);

  // Add user to Supabase when authenticated
  useEffect(() => {
    const addUserToSupabase = async () => {
      if (authenticated && user) {
        try {
          const { error } = await supabase
            .from('users')
            .upsert({ 
              did: user.id,
              rating: 1200 
            }, { 
              onConflict: 'did'
            });

          if (error) {
            console.error('Error adding user to Supabase:', error);
            toast.error('Failed to sync user data');
          }
        } catch (error) {
          console.error('Error in addUserToSupabase:', error);
          toast.error('Failed to sync user data');
        }
      }
    };

    addUserToSupabase();
  }, [authenticated, user]);

  // Check if user has completed profile
  useEffect(() => {
    const checkProfile = async () => {
      if (authenticated && user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('display_name, avatar_url')
            .eq('did', user.id)
            .maybeSingle();

          if (error) {
            console.error('Error checking profile:', error);
            toast.error('Failed to load profile');
            return;
          }

          setHasProfile(Boolean(data?.display_name && data?.avatar_url));
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

  // Fetch leaderboard data
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
    <div className="min-h-screen bg-gaming-background text-gaming-text-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Main Actions */}
          <div className="space-y-6">
            <div className="bg-gaming-card rounded-xl p-6 border border-gaming-accent">
              <div className="flex items-center gap-4 mb-6">
                <Swords className="w-8 h-8 text-gaming-primary" />
                <h2 className="text-2xl font-bold">Battle Arena</h2>
              </div>
              <WalletSection />
              {authenticated && !hasProfile ? (
                <OnboardingFlow />
              ) : (
                <NotificationSection />
              )}
            </div>
          </div>

          {/* Right Column - Leaderboard */}
          <div className="bg-gaming-card rounded-xl p-6 border border-gaming-accent">
            <div className="flex items-center gap-4 mb-6">
              <Trophy className="w-8 h-8 text-gaming-warning" />
              <h2 className="text-2xl font-bold">Top Warriors</h2>
            </div>
            <div className="space-y-4">
              {leaderboardUsers.map((player, index) => (
                <div 
                  key={player.did}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gaming-accent/20 border border-gaming-accent/50"
                >
                  <span className="text-xl font-bold text-gaming-warning">
                    #{index + 1}
                  </span>
                  <Avatar className="h-10 w-10 border-2 border-gaming-accent">
                    <AvatarImage 
                      src={player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.did}`} 
                      alt={player.display_name || player.did} 
                    />
                    <AvatarFallback>
                      {(player.display_name || player.did).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{player.display_name || player.did}</p>
                    <p className="text-sm text-gaming-text-secondary">{player.rating} ELO</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;