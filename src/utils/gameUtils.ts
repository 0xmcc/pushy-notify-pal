import { supabase } from "@/integrations/supabase/client";
import { Game } from "@/types/game";
import { toast } from "sonner";

export const fetchGames = async (stakeRange: [number, number]): Promise<Game[]> => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*, player1:users!matches_player1_did_fkey(rating, display_name)')
      .eq('status', 'pending')
      .is('player2_did', null)
      .gte('stake_amount', stakeRange[0])
      .lte('stake_amount', stakeRange[1])
      .order('expiration_date', { ascending: false });

    if (error) throw error;
    
    const realGames = (data || []).map(game => ({
      id: game.id,
      player1_did: game.player1_did,
      player2_did: game.player2_did,
      stake_amount: game.stake_amount,
      status: game.status,
      expiration_date: game.expiration_date,
      player1_move: game.player1_move,
      player2_move: game.player2_move,
      creator_rating: game.player1?.rating,
      creator_name: game.player1?.display_name || game.player1_did
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
    if (move === 'claim') {
      // Handle claim action
      const { error } = await supabase
        .from('matches')
        .update({ 
          status: 'completed',
          winner_did: userId
        })
        .eq('id', gameId);

      if (error) throw error;
      toast.success('Reward claimed successfully!');
    } else {
      // Handle regular move
      const { error } = await supabase
        .from('matches')
        .update({ 
          player2_did: userId,
          player2_move: move, // Now sending '0', '1', or '2'
          player2_move_timestamp: new Date().toISOString(),
          status: 'in_progress'
        })
        .eq('id', gameId);

      if (error) throw error;
      toast.success(`Move played successfully!`);
    }
  } catch (error) {
    console.error('Error playing move:', error);
    toast.error("Failed to play move");
  }
};

// Mock data for development and testing
export const mockGames: Game[] = [
  {
    id: 'mock-1',
    player1_did: 'CryptoNinja',
    player2_did: null,
    stake_amount: 50,
    status: 'pending',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '0', // rock
    player2_move: null,
    creator_name: 'CryptoNinja',
    creator_rating: 1850
  },
  {
    id: 'mock-2',
    player1_did: 'Web3Warrior',
    player2_did: 'BlockMaster',
    stake_amount: 100,
    status: 'in_progress',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '1', // paper
    player2_move: '2', // scissors
    creator_name: 'Web3Warrior',
    creator_rating: 1650,
    winner_did: 'BlockMaster'
  },
  {
    id: 'mock-3',
    player1_did: 'ChainChampion',
    player2_did: null,
    stake_amount: 250,
    status: 'pending',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '2', // scissors
    player2_move: null,
    creator_name: 'ChainChampion',
    creator_rating: 2100
  },
  {
    id: 'mock-4',
    player1_did: 'TokenTitan',
    player2_did: 'CryptoKing',
    stake_amount: 500,
    status: 'completed',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '0', // rock
    player2_move: '2', // scissors
    creator_name: 'TokenTitan',
    creator_rating: 1920,
    winner_did: 'TokenTitan'
  },
  {
    id: 'mock-5',
    player1_did: 'MetaMaster',
    player2_did: null,
    stake_amount: 1000,
    status: 'pending',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '1', // paper
    player2_move: null,
    creator_name: 'MetaMaster',
    creator_rating: 2250
  },
  {
    id: 'mock-6',
    player1_did: 'ByteBoss',
    player2_did: 'HashHero',
    stake_amount: 750,
    status: 'in_progress',
    expiration_date: new Date(Date.now() + 86400000).toISOString(),
    player1_move: '2', // scissors
    player2_move: '1', // paper
    creator_name: 'ByteBoss',
    creator_rating: 1750,
    winner_did: 'ByteBoss'
  }
];