'use client';

import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LockIcon } from "lucide-react";

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

// Mock data with more game-like usernames and avatars
const mockGames: Game[] = [
  {
    id: '1',
    creator_did: 'BlockMaster',
    stake_amount: 50,
    created_at: new Date().toISOString(),
    selected_move: 'hidden'
  },
  {
    id: '2',
    creator_did: 'CryptoNinja',
    stake_amount: 100,
    created_at: new Date().toISOString(),
    selected_move: 'hidden'
  },
  {
    id: '3',
    creator_did: 'Web3Warrior',
    stake_amount: 75,
    created_at: new Date().toISOString(),
    selected_move: 'hidden'
  }
];

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
      
      // Combine real data with mock data and filter by stake range
      const allGames = [...(data || []), ...mockGames].filter(
        game => game.stake_amount >= stakeRange[0] && game.stake_amount <= stakeRange[1]
      );
      
      setGames(allGames);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error("Failed to load games");
    } finally {
      setIsLoading(false);
    }
  };

  const playMove = async (gameId: string, move: string) => {
    try {
      const { error } = await supabase
        .from('active_games')
        .update({ 
          opponent_did: 'test-user-2', // Temporary hardcoded user ID
          selected_move: move
        })
        .eq('id', gameId);

      if (error) throw error;
      
      toast.success(`Played ${move}!`);
    } catch (error) {
      console.error('Error playing move:', error);
      toast.error("Failed to play move");
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
        <div 
          key={game.id}
          className="relative border border-gaming-accent rounded-lg p-6 bg-gaming-card/80 backdrop-blur-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-12 w-12 border-2 border-gaming-accent">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${game.creator_did}`} />
              <AvatarFallback>
                {game.creator_did.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold text-gaming-text-primary">
                {game.creator_did}
              </h3>
              <p className="text-gaming-text-secondary flex items-center gap-2">
                <span>1680 ELO</span>
                <span className="text-gaming-accent">•</span>
                <span>{game.stake_amount} SOL</span>
              </p>
            </div>
            <div className="absolute right-6 top-6">
              <LockIcon className="w-8 h-8 text-gaming-accent opacity-50" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {['rock', 'paper', 'scissors'].map((move) => (
              <button
                key={move}
                onClick={() => playMove(game.id, move)}
                className="relative group px-4 py-3 rounded-lg bg-gaming-accent/20 hover:bg-gaming-accent/30 transition-colors border border-gaming-accent/50 hover:border-gaming-accent"
              >
                <span className="absolute -top-3 -right-3 w-6 h-6 flex items-center justify-center bg-gaming-primary rounded-full text-sm font-bold text-white">
                  {game.stake_amount}
                </span>
                <span className="block text-center text-gaming-text-primary group-hover:text-white transition-colors">
                  Play {move}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};