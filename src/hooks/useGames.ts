import { useState, useEffect } from "react";
import { Game } from "@/types/game";
import { supabase } from "@/integrations/supabase/client";
import { fetchGames, mockGames } from "@/utils/gameUtils";

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
      console.log("Fetching games from Supabase...");
      const realGames = await fetchGames(stakeRange);
      console.log("Fetched games:", realGames);
      const filteredMockGames = mockGames.filter(
        game => game.stake_amount >= stakeRange[0] && game.stake_amount <= stakeRange[1]
      );
      setGames([...realGames, ...filteredMockGames]);
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
      console.log("Setting up realtime subscription for active games");
      const channel = supabase
        .channel('active_games_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'active_games' }, 
          (payload) => {
            console.log("Received realtime update:", payload);
            loadGames();
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