import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from "@/integrations/supabase/client";

export const WalletBalance = () => {
  const { user } = usePrivy();
  const [onChainBalance, setOnChainBalance] = useState<number | null>(null);
  const [offChainBalance, setOffChainBalance] = useState<number>(0);

  useEffect(() => {
    const fetchBalances = async () => {
      if (user?.wallet?.address) {
        try {
          // Fetch on-chain balance
          const connection = new Connection('https://api.devnet.solana.com');
          const publicKey = new PublicKey(user.wallet.address);
          const balanceInLamports = await connection.getBalance(publicKey);
          setOnChainBalance(balanceInLamports / LAMPORTS_PER_SOL);

          // Fetch off-chain balance
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
        } catch (error) {
          console.error('Error fetching balances:', error);
          setOnChainBalance(null);
        }
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [user?.wallet?.address, user?.id]);

  if (!user?.wallet?.address) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1 text-sm text-gaming-text-primary">
        <span>{onChainBalance?.toFixed(2)}</span>
        <span className="text-gaming-text-secondary">SOL</span>
      </div>
      {offChainBalance > 0 && (
        <div className="flex items-center gap-1 text-xs text-gaming-text-secondary">
          <span>+{offChainBalance.toFixed(2)}</span>
          <span>off-chain</span>
        </div>
      )}
    </div>
  );
};