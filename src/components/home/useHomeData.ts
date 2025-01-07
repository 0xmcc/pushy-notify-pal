import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game } from '@/types/game';

export const useHomeData = () => {
  return useQuery({
    queryKey: ['home-data'],
    queryFn: async () => {
      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return matches;
    }
  });
};