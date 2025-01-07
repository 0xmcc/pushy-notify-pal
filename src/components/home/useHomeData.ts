import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useHomeData = () => {
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
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return matches;
    }
  });
};