'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Game {
  id: string;
  player1_did: string;
  stake_amount: number;
  created_at: string;
}

export const ActiveGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGames();
    
    // Subscribe to changes
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
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('active_games')
        .select('*')
        .eq('status', 'active')
        .is('player2_did', null)
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
          player2_did: 'test-user-2', // Temporary hardcoded user ID
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
              Created by: {game.player1_did}
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