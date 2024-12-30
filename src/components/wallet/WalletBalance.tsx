import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from "@/integrations/supabase/client";

export const WalletBalance = () => {
  const { user } = usePrivy();
  const [offChainBalance, setOffChainBalance] = useState<number>(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (user?.id) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('off_chain_balance')
          .eq('did', user.id)
          .single();

        if (error) {
          console.error('Error fetching off-chain balance:', error);
        } else {
          setOffChainBalance(userData.off_chain_balance || 0);
        }
      }
    };

    // Initial fetch
    fetchBalance();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `did=eq.${user?.id}`
        },
        (payload) => {
          console.log('Balance update received:', payload);
          const newBalance = payload.new.off_chain_balance || 0;
          setOffChainBalance(newBalance);
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (!user?.id) return null;

  return (
    <div className="flex items-center gap-1 text-sm text-gaming-text-primary">
      <span>{offChainBalance.toFixed(2)}</span>
      <span className="text-gaming-text-secondary">credits</span>
    </div>
  );
};