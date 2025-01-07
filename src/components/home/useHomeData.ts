import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game } from '@/types/game';

export const useHomeData = () => {
  return useQuery({
    queryKey: ['home-data'],
    queryFn: async () => {
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          *,
          creator:users!matches_player1_did_fkey (
            display_name,
            rating
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return matches?.map(match => ({
        ...match,
        creator_name: match.creator?.display_name || match.player1_did,
        creator_rating: match.creator?.rating
      }));
    }
  });
};