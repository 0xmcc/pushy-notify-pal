'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LeaderboardList } from '@/components/leaderboard/LeaderboardList';
import { GameCard } from '@/components/multiplayer/GameCard';
import type { Game } from '@/types/game';

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
  const [featuredGame, setFeaturedGame] = useState<Game | null>(null);

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

  useEffect(() => {
    const fetchFeaturedGame = async () => {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select(`
            *,
            player1:player1_did(display_name, avatar_url, rating),
            player2:player2_did(display_name, avatar_url, rating)
          `)
          .eq('status', 'pending')
          .limit(1)
          .single();

        if (error) throw error;
        if (data) setFeaturedGame(data as unknown as Game);
      } catch (error) {
        console.error('Error fetching featured game:', error);
      }
    };

    fetchFeaturedGame();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gaming-background flex items-center justify-center">
        <div className="animate-pulse text-gaming-text-primary">Loading...</div>
      </div>
    );
  }

  const handlePlayMove = async (gameId: string, move: string) => {
    // This is just a placeholder function since GameCard requires it
    console.log('Move played:', gameId, move);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gaming-background via-gaming-background/95 to-gaming-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.1),rgba(139,92,246,0.05))] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent animate-float">
            Rock Paper Scissors
          </h1>
          <p className="text-xl text-gaming-text-secondary max-w-2xl mx-auto">
            Experience the classic game with a competitive twist. Stake items, climb the ranks, and become a champion.
          </p>
        </div>

        {/* Featured Game */}
        {featuredGame && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gaming-text-primary">Featured Game</h2>
            <GameCard game={featuredGame} onPlayMove={handlePlayMove} />
          </div>
        )}

        {/* Leaderboard */}
        <LeaderboardList users={leaderboardUsers} />
      </div>
    </div>
  );
};

export default HomePage;