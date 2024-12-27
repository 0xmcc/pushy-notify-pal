'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Game {
  id: string;
  creator_did: string;
  stake_amount: number;
  created_at: string;
  selected_move: string;
}

interface ActiveGamesProps {
  stakeRange: [number, number];
}

export const ActiveGames = ({ stakeRange }: ActiveGamesProps) => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGames();
    
    const channel = supabase
      .channel('active_games_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'active_games' }, 
        () => {
          fetchGames();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stakeRange]);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('active_games')
        .select('*')
        .eq('status', 'active')
        .is('opponent_did', null)
        .gte('stake_amount', stakeRange[0])
        .lte('stake_amount', stakeRange[1])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error("Failed to load games");
    } finally {
      setIsLoading(false);
    }
  };

  const joinGame = async (gameId: string) => {
    try {
      const { error } = await supabase
        .from('active_games')
        .update({ 
          opponent_did: 'test-user-2', // Temporary hardcoded user ID
        })
        .eq('id', gameId);

      if (error) throw error;
      
      toast.success("Joined game successfully!");
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error("Failed to join game");
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading games...</div>;
  }

  if (games.length === 0) {
    return <div className="text-center py-4">No active games available</div>;
  }

  return (
    <div className="space-y-4">
      {games.map((game) => (
        <div 
          key={game.id}
          className="border rounded-lg p-4 flex justify-between items-center bg-white shadow-sm"
        >
          <div>
            <p className="font-medium">Stake: {game.stake_amount}</p>
            <p className="text-sm text-gray-500">
              Created by: {game.creator_did}
            </p>
          </div>
          <Button onClick={() => joinGame(game.id)}>
            Join Game
          </Button>
        </div>
      ))}
    </div>
  );
};