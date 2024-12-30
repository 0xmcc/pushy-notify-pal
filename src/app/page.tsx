'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trophy, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-gradient-to-b from-gaming-background via-gaming-background/95 to-gaming-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.1),rgba(139,92,246,0.05))] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="gaming-card backdrop-blur-sm bg-gaming-card/80 border-gaming-accent/50 shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(139,92,246,0.2)] group">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2 rounded-lg bg-gaming-accent/20 group-hover:bg-gaming-accent/30 transition-colors">
              <Trophy className="w-8 h-8 text-gaming-warning" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gaming-warning to-gaming-primary bg-clip-text text-transparent">
              Top Warriors
            </h2>
          </div>
          <div className="space-y-4">
            {leaderboardUsers.map((player, index) => (
              <div 
                key={player.did}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-all duration-300",
                  "bg-gaming-accent/10 hover:bg-gaming-accent/20",
                  "border border-gaming-accent/30 hover:border-gaming-accent/50",
                  "group/player relative overflow-hidden"
                )}
              >
                {/* Top 3 indicator */}
                {index < 3 && (
                  <div className="absolute top-0 right-0 p-1">
                    <Sparkles className="w-4 h-4 text-gaming-warning animate-pulse" />
                  </div>
                )}
                
                <span className={cn(
                  "text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full",
                  index === 0 && "bg-yellow-500/20 text-yellow-500",
                  index === 1 && "bg-gray-300/20 text-gray-300",
                  index === 2 && "bg-amber-600/20 text-amber-600",
                  index > 2 && "bg-gaming-accent/20 text-gaming-text-secondary"
                )}>
                  #{index + 1}
                </span>
                
                <Avatar className={cn(
                  "h-10 w-10 border-2 transition-all duration-300",
                  "group-hover/player:scale-110",
                  index === 0 && "border-yellow-500 ring-2 ring-yellow-500/20",
                  index === 1 && "border-gray-300 ring-2 ring-gray-300/20",
                  index === 2 && "border-amber-600 ring-2 ring-amber-600/20",
                  index > 2 && "border-gaming-accent"
                )}>
                  <AvatarImage 
                    src={player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.did}`} 
                    alt={player.display_name || player.did} 
                  />
                  <AvatarFallback>
                    {(player.display_name || player.did).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <p className="font-medium text-gaming-text-primary group-hover/player:text-white transition-colors">
                    {player.display_name || player.did}
                  </p>
                  <p className="text-sm text-gaming-text-secondary flex items-center gap-2">
                    <span className="font-mono">{player.rating}</span>
                    <span className="text-xs text-gaming-accent">ELO</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;