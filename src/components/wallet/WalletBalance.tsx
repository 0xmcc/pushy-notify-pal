import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export const WalletBalance = () => {
  const { user } = usePrivy();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (user?.wallet?.address) {
        try {
          // TODO: Implement actual balance fetching once we have the complete smart contract documentation
          // For now, we'll show a mock balance
          setBalance(2.5);
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance(null);
        }
      }
    };

    fetchBalance();
  }, [user?.wallet?.address]);

  if (!user?.wallet?.address || balance === null) return null;

  return (
    <div className="flex items-center gap-1 text-sm text-gaming-text-primary">
      <span>{balance.toFixed(2)}</span>
      <span className="text-gaming-text-secondary">SOL</span>
    </div>
  );
};