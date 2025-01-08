import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game } from '@/types/game';
import { usePrivy } from '@privy-io/react-auth';

export const useHomeData = () => {
  const { user } = usePrivy();
  
  return useQuery({
    queryKey: ['home-data'],
    queryFn: async () => {
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          *,
          player1:player1_did(did, display_name, rating),
          player2:player2_did(did, display_name, rating)
        `)
        .eq('status', 'pending')
        .neq('player1_did', user?.id || '')
        .order('created_at', { ascending: false })
        .limit(10);


      if (error) throw error;
      console.log("matches", matches);
      return matches?.map(match => ({
        ...match,
        creator_name: match.player1?.display_name || match.player1_did,
        creator_rating: match.player1?.rating
      }));
    },
    enabled: !!user
  });
};