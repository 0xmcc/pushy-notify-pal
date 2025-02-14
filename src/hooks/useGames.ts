import { useState, useEffect } from "react";
import { Game } from "@/types/game";
import { fetchGamesFromSupabase, setupRealtimeSubscription } from "@/utils/gameApi";
import { getOfflineGames } from "@/utils/offlineGames";
import { supabase } from "@/integrations/supabase/client";
import { usePrivy } from "@privy-io/react-auth";

export const useGames = (stakeRange: [number, number]) => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { user } = usePrivy();

   // Handle online/offline status
   useEffect(() => {
    const handleOnline = async () => {
      console.log("MCC App is online, refreshing games...");
      setIsOffline(false);
      await loadGames();
    };

    const handleOffline = () => {
      console.log("MCC App is offline, showing cached/mock data");
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
    console.log("MCC useEffect CHANGES", stakeRange, isOffline, user?.id);
    
    if (!isOffline) {
      loadGames();
      const channel = setupRealtimeSubscription(loadGames);
      return () => {
        console.log("Cleaning up realtime subscription");
        supabase.removeChannel(channel);
      };
    }
  }, [stakeRange, isOffline, user]); // Added user as dependency
  
  const loadGames = async () => {
    if (isOffline) {
      setGames(getOfflineGames(stakeRange));
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log("MCC fetch games from supabase", user?.id);
      const games = await fetchGamesFromSupabase(stakeRange, user?.id);
      console.log("MCC useGames loadGames() games", games);
      setGames(games);
    } catch (err) {
      console.error("Error loading games:", err);
      setError("Failed to load games. Using mock data instead.");
      setGames(getOfflineGames(stakeRange));
    } finally {
      setIsLoading(false);
    }
  };

  return { games, isLoading, error, isOffline };
};