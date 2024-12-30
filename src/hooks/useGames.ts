import { useState, useEffect } from "react";
import { Game } from "@/types/game";
import { fetchGamesFromSupabase, setupRealtimeSubscription } from "@/utils/gameApi";
import { getOfflineGames } from "@/utils/offlineGames";
import { supabase } from "@/integrations/supabase/client";

export const useGames = (stakeRange: [number, number]) => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const loadGames = async () => {
    if (isOffline) {
      setGames(getOfflineGames(stakeRange));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const games = await fetchGamesFromSupabase(stakeRange);
      setGames(games.filter(game => 
        game.stake_amount >= stakeRange[0] && game.stake_amount <= stakeRange[1]
      ));
    } catch (err) {
      console.error("Error loading games:", err);
      setError("Failed to load games. Using mock data instead.");
      setGames(getOfflineGames(stakeRange));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log("App is online, refreshing games...");
      setIsOffline(false);
      loadGames();
    };

    const handleOffline = () => {
      console.log("App is offline, showing cached/mock data");
      setIsOffline(true);
      setGames(getOfflineGames(stakeRange));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [stakeRange]);

  // Handle initial load and realtime updates
  useEffect(() => {
    loadGames();
    
    if (!isOffline) {
      const channel = setupRealtimeSubscription(loadGames);
      return () => {
        console.log("Cleaning up realtime subscription");
        supabase.removeChannel(channel);
      };
    }
  }, [stakeRange, isOffline]);

  return { games, isLoading, error, isOffline };
};