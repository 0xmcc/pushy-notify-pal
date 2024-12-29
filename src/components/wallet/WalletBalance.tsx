import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export const WalletBalance = () => {
  const { user } = usePrivy();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {

      if (user?.wallet?.address) {
        console.log("HEY", user.wallet.address)
        try {
          const connection = new Connection('https://api.devnet.solana.com');
          const publicKey = new PublicKey(user.wallet.address);
          console.log('publicKey', publicKey);
          const balanceInLamports = await connection.getBalance(publicKey);
          setBalance(balanceInLamports / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error('Error fetching balance:', error);
   
          setBalance(null);
        }
      }
    };

    fetchBalance();
    // Optional: Set up an interval to refresh balance periodically
    const interval = setInterval(fetchBalance, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, [user?.wallet?.address]);

  if (!user?.wallet?.address || balance === null) return null;

  return (
    <div className="flex items-center gap-1 text-sm text-gaming-text-primary">
      <span>{balance.toFixed(2)}</span>
      <span className="text-gaming-text-secondary">SOL</span>
    </div>
  );
};