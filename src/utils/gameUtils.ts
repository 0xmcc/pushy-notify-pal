import { supabase } from "@/integrations/supabase/client";
import { Game } from "@/types/game";
import { toast } from "sonner";

export const fetchGames = async (stakeRange: [number, number]): Promise<Game[]> => {
  try {
    const { data, error } = await supabase
      .from('active_games')
      .select('*, creator:users!active_games_creator_did_fkey(rating, display_name)')
      .eq('status', 'active')
      .is('opponent_did', null)
      .gte('stake_amount', stakeRange[0])
      .lte('stake_amount', stakeRange[1])
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const realGames = (data || []).map(game => ({
      ...game,
      creator_rating: game.creator?.rating,
      creator_name: game.creator?.display_name || game.creator_did
    }));
    
    return realGames;
  } catch (error) {
    console.error('Error fetching games:', error);
    toast.error("Failed to load games");
    return [];
  }
};

export const playGameMove = async (gameId: string, move: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('active_games')
      .update({ 
        opponent_did: userId,
        selected_move: move
      })
      .eq('id', gameId);

    if (error) throw error;
    
    toast.success(`Move played successfully!`);
  } catch (error) {
    console.error('Error playing move:', error);
    toast.error("Failed to play move");
  }
};

// Mock data for development and testing
export const mockGames: Game[] = [
  {
    id: 'mock-1',
    creator_did: 'CryptoNinja',
    creator_name: 'CryptoNinja',
    stake_amount: 50,
    created_at: new Date().toISOString(),
    selected_move: 'hidden',
    creator_rating: 1850
  },
  {
    id: 'mock-2',
    creator_did: 'Web3Warrior',
    creator_name: 'Web3Warrior',
    stake_amount: 100,
    created_at: new Date().toISOString(),
    selected_move: 'hidden',
    creator_rating: 1650
  },
  {
    id: 'mock-3',
    creator_did: 'BlockMaster',
    creator_name: 'BlockMaster',
    stake_amount: 75,
    created_at: new Date().toISOString(),
    selected_move: 'hidden',
    creator_rating: 2100
  },
  {
    id: 'mock-4',
    creator_did: 'ChainChampion',
    creator_name: 'ChainChampion',
    stake_amount: 150,
    created_at: new Date().toISOString(),
    selected_move: 'hidden',
    creator_rating: 1920
  },
  {
    id: 'mock-5',
    creator_did: 'TokenTitan',
    creator_name: 'TokenTitan',
    stake_amount: 200,
    created_at: new Date().toISOString(),
    selected_move: 'hidden',
    creator_rating: 1750
  }
];