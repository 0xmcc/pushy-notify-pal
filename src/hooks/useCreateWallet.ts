import { useState } from "react";
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCreateWallet = () => {
  const { user } = usePrivy();
  const { createWallet } = useSolanaWallets();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  const handleCreateWallet = async () => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setIsCreatingWallet(true);
    try {
      const wallet = await createWallet();
      console.log('Created wallet:', wallet);
      
      // Update the wallet address in Supabase
      const { error } = await supabase
        .from('users')
        .update({ wallet_address: wallet.address })
        .eq('did', user.id);

      if (error) {
        console.error('Error updating wallet address:', error);
        toast.error('Failed to save wallet address');
        return;
      }

      toast.success('Successfully created wallet');
      return wallet;
    } catch (error) {
      console.error('Failed to create wallet:', error);
      toast.error('Failed to create wallet');
      return null;
    } finally {
      setIsCreatingWallet(false);
    }
  };

  return {
    handleCreateWallet,
    isCreatingWallet
  };
}; 