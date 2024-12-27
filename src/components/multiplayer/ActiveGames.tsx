'use client';

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { supabase } from "@/integrations/supabase/client";
import { Game } from "@/types/game";
import { GameCard } from "./GameCard";
import { fetchGames, playGameMove, mockGames } from "@/utils/gameUtils";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ActiveGamesProps {
  stakeRange: [number, number];
}

export const ActiveGames = ({ stakeRange }: ActiveGamesProps) => {
  const { user, authenticated } = usePrivy();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log("App is online, refreshing games...");
      setIsOffline(false);
      loadGames();
    };

    const handleOffline = () => {
      console.log("App is offline, showing cached/mock data");
      setIsOffline(true);
      // When offline, show only mock games
      setGames(mockGames.filter(
        game => game.stake_amount >= stakeRange[0] && game.stake_amount <= stakeRange[1]
      ));
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
    
    // Only set up realtime subscription if online
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
      // Fallback to mock games on error
      const filteredMockGames = mockGames.filter(
        game => game.stake_amount >= stakeRange[0] && game.stake_amount <= stakeRange[1]
      );
      setGames(filteredMockGames);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayMove = async (gameId: string, move: string) => {
    if (!authenticated) {
      toast.error("Please sign in to play");
      return;
    }

    if (isOffline) {
      toast.error("Cannot play moves while offline");
      return;
    }

    if (user?.id) {
      try {
        console.log("Playing move:", { gameId, move, userId: user.id });
        await playGameMove(gameId, move, user.id);
        toast.success("Move played successfully!");
      } catch (err) {
        console.error("Error playing move:", err);
        toast.error("Failed to play move. Please try again.");
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-4 text-gaming-text-secondary">Loading games...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-4 text-gaming-text-secondary">
        {isOffline ? "No games available offline" : "No active games available"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isOffline && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are currently offline. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}
      {games.map((game) => (
        <GameCard 
          key={game.id} 
          game={game} 
          onPlayMove={handlePlayMove}
        />
      ))}
    </div>
  );
};