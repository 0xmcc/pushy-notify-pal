import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePrivy } from '@privy-io/react-auth';

export const useUserCheck = () => {
  const { user, ready } = usePrivy();
  const [isChecking, setIsChecking] = useState(true);
  const [exists, setExists] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      if (!ready || !user) {
        setIsChecking(false);
        setExists(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('did')
          .eq('did', user.id)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          setExists(false);
          return;
        }

        setExists(!!data);
      } catch (error) {
        console.error('Error checking user:', error);
        setExists(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkUser();
  }, [user, ready]);

  return { isChecking, exists };
}; 