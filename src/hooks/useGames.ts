import { useState, useEffect } from "react";
import { Game } from "@/types/game";
import { supabase } from "@/integrations/supabase/client";
import { mockGames } from "@/utils/gameUtils";

export const useGames = (stakeRange: [number, number]) => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const loadGames = async () => {
    if (isOffline) {
      console.log("Loading mock games only (offline mode)");
      const filteredMockGames = mockGames.filter(
        game => game.stake_amount >= stakeRange[0] && game.stake_amount <= stakeRange[1]
      );
      setGames(filteredMockGames);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching games from Supabase matches table...");
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          player1:users!matches_player1_did_fkey(
            rating,
            display_name
          )
        `)
        .or('status.eq.pending,status.eq.in_progress,status.eq.completed')
        .gte('stake_amount', stakeRange[0])
        .lte('stake_amount', stakeRange[1])
        .order('expiration_date', { ascending: false });

      if (matchesError) throw matchesError;

      const realGames = (matchesData || []).map(match => ({
        id: match.id,
        player1_did: match.player1_did,
        player2_did: match.player2_did,
        stake_amount: match.stake_amount,
        status: match.status,
        expiration_date: match.expiration_date,
        player1_move: match.player1_move,
        player2_move: match.player2_move,
        creator_rating: match.player1?.rating,
        creator_name: match.player1?.display_name || match.player1_did,
        winner_did: match.winner_did
      }));

      console.log("Fetched games:", realGames);
      setGames(realGames.filter(game => 
        game.stake_amount >= stakeRange[0] && game.stake_amount <= stakeRange[1]
      ));
    } catch (err) {
      console.error("Error loading games:", err);
      setError("Failed to load games. Using mock data instead.");
      const filteredMockGames = mockGames.filter(
        game => game.stake_amount >= stakeRange[0] && game.stake_amount <= stakeRange[1]
      );
      setGames(filteredMockGames);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      console.log("App is online, refreshing games...");
      setIsOffline(false);
      loadGames();
    };

    const handleOffline = () => {
      console.log("App is offline, showing cached/mock data");
      setIsOffline(true);
      const filteredMockGames = mockGames.filter(
        game => game.stake_amount >= stakeRange[0] && game.stake_amount <= stakeRange[1]
      );
      setGames(filteredMockGames);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [stakeRange]);

  useEffect(() => {
    loadGames();
    
    if (!isOffline) {
      console.log("Setting up realtime subscription for matches");
      const channel = supabase
        .channel('matches_changes')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'matches'
          },
          (payload) => {
            console.log("Received realtime update:", payload);
            loadGames(); // Reload the entire games list when any change occurs
          }
        )
        .subscribe((status) => {
          console.log("Realtime subscription status:", status);
        });

      return () => {
        console.log("Cleaning up realtime subscription");
        supabase.removeChannel(channel);
      };
    }
  }, [stakeRange, isOffline]);

  return { games, isLoading, error, isOffline };
};