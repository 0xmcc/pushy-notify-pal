import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Game } from '@/types/game';
import type { LeaderboardUser } from '@/types/user';

export const useHomeData = () => {
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
            creator:player1_did(
              display_name,
              rating
            ),
            opponent:player2_did(
              display_name,
              rating
            )
          `)
          .eq('status', 'pending')
          .limit(1)
          .single();

        if (error) throw error;
        if (data) {
          const gameWithNames: Game = {
            ...data,
            creator_name: data.creator?.display_name || data.player1_did.slice(0, 8),
            creator_rating: data.creator?.rating || 1200
          };
          setFeaturedGame(gameWithNames);
        }
      } catch (error) {
        console.error('Error fetching featured game:', error);
      }
    };

    fetchFeaturedGame();
  }, []);

  return {
    isLoading,
    leaderboardUsers,
    featuredGame
  };
};