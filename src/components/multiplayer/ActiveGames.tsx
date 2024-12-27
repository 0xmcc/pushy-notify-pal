'use client';

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { supabase } from "@/integrations/supabase/client";
import { Game } from "@/types/game";
import { GameCard } from "./GameCard";
import { fetchGames, playGameMove, mockGames } from "@/utils/gameUtils";
import { toast } from "sonner";

interface ActiveGamesProps {
  stakeRange: [number, number];
}

export const ActiveGames = ({ stakeRange }: ActiveGamesProps) => {
  const { user, authenticated } = usePrivy();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGames();
    
    const channel = supabase
      .channel('active_games_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'active_games' }, 
        () => {
          loadGames();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stakeRange]);

  const loadGames = async () => {
    setIsLoading(true);
    try {
      const realGames = await fetchGames(stakeRange);
      const filteredMockGames = mockGames.filter(
        game => game.stake_amount >= stakeRange[0] && game.stake_amount <= stakeRange[1]
      );
      setGames([...realGames, ...filteredMockGames]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayMove = async (gameId: string, move: string) => {
    if (!authenticated) {
      toast.error("Please sign in to play");
      return;
    }

    if (user?.id) {
      await playGameMove(gameId, move, user.id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4 text-gaming-text-secondary">Loading games...</div>;
  }

  if (games.length === 0) {
    return <div className="text-center py-4 text-gaming-text-secondary">No active games available</div>;
  }

  return (
    <div className="space-y-4">
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