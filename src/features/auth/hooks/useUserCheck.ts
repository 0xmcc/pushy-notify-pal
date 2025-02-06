import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePrivy } from '@privy-io/react-auth';

export const useUserCheck = () => {
  const { user, ready } = usePrivy();
  const [isChecking, setIsChecking] = useState(true);
  const [exists, setExists] = useState<boolean | null>(null);
  const [dbUser, setDbUser] = useState<any | null>(null);
  const checkUser = async () => {
    console.log('1. checkUser called', user, ready);
    if (!ready || !user) {
      setIsChecking(false);
      setExists(null);
      setDbUser(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('did', user.id)
        .single();

      console.log('3. marko data', data);
      if (error) {
        console.error('Supabase error:', error);
        setExists(false);
        setDbUser(null);
        return;
      }
      console.log('3.5 marko setting exists', data);
      setExists(!!data);
      setDbUser(data);
    } catch (error) {
      console.error('Error checking user:', error);
      setExists(false);
      setDbUser(null);
    } finally {
      setIsChecking(false);
    }
  };
  
  useEffect(() => {
    console.log('1. useUserCheck useEffect called', user, ready);
    checkUser();

    
  }, [user, ready]);
  console.log('marko User details', dbUser, user);
  return { 
    isChecking, 
    exists, 
    user: dbUser,
    ready,
    privyUser: user
  };
}; 