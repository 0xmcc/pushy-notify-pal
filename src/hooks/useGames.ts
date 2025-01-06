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
    console.log("MCC useEffect CHANGES",stakeRange, isOffline);
    loadGames();
    
    if (!isOffline) {
      const channel = setupRealtimeSubscription(loadGames);
      return () => {
        console.log("Cleaning up realtime subscription");
        supabase.removeChannel(channel);
      };
    }
  }, [stakeRange, isOffline]);
  
  const loadGames = async () => {
    console.log("MCC loadGames",stakeRange, isOffline);
 

    setIsLoading(true);
    setError(null);
    
    try {
      console.log("MCC fetch games from supabase",user?.id);
      setTimeout(async () => {
        console.log("MCC fetch games from supabase 2",user?.id);
        const games = await fetchGamesFromSupabase(stakeRange, user?.id);
        setGames(games.filter(game => 
          game.stake_amount >= stakeRange[0] && game.stake_amount <= stakeRange[1]
        ));
      }, 1000);
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