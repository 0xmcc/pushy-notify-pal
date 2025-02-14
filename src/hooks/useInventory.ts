import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { supabase } from "@/integrations/supabase/client";
import { Inventory } from "@/types/game";


export const useInventory = () => {
  const { user } = usePrivy();
  const [inventory, setInventory] = useState<Inventory>({
    rock_count: 0,
    paper_count: 0,
    scissors_count: 0,
    off_chain_balance: 0
  });

  useEffect(() => {
    const fetchInventory = async () => {
      if (user?.id) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('rock_count, paper_count, scissors_count, off_chain_balance')
          .eq('did', user.id)
          .single();

        if (!error && userData) {
          setInventory(userData);
        }
      }
    };

    fetchInventory();

    const channel = supabase
      .channel('inventory-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `did=eq.${user?.id}`
        },
        (payload) => {
          setInventory({
            rock_count: payload.new.rock_count,
            paper_count: payload.new.paper_count,
            scissors_count: payload.new.scissors_count,
            off_chain_balance: payload.new.off_chain_balance
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return inventory;
};