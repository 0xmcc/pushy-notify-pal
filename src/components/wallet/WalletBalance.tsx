import { useUser } from '@/contexts/UserProvider';
import { useSolanaWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export const WalletBalance = () => {
  const { userStats } = useUser();
  const { wallets, ready } = useSolanaWallets();
  const [solanaBalance, setSolanaBalance] = useState<number | null>(null);
  const [showSolBalance, setShowSolBalance] = useState(false);

  // Get the first available Solana wallet
  const solanaWallet = wallets[0];

  useEffect(() => {
    const fetchSolanaBalance = async () => {
      console.log("SOLANA WALLET:", solanaWallet, "READY:", ready, "WALLETS:", wallets);
      if (!solanaWallet?.address) return;

      try {
        const connection = new Connection('https://api.devnet.solana.com');
        const publicKey = new PublicKey(solanaWallet.address);
        const balance = await connection.getBalance(publicKey);
        console.log("SOL BALANCE:", balance / LAMPORTS_PER_SOL);
        setSolanaBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching Solana balance:', error);
        setSolanaBalance(null);
      }
    };

    fetchSolanaBalance();
    const interval = setInterval(fetchSolanaBalance, 30000);
    return () => clearInterval(interval);
  }, [solanaWallet?.address, ready]);

  if (!userStats) return null;

  return (
    <div 
      className="flex flex-col items-end cursor-pointer" 
      onClick={() => setShowSolBalance(!showSolBalance)}
    >
      {showSolBalance ? (
        <div className="flex items-center gap-1 text-sm text-gaming-text-primary">
          <span>{solanaBalance?.toFixed(4) ?? '0.0000'}</span>
          <span className="text-gaming-text-secondary">SOL</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-sm text-gaming-text-primary">
          <span>{userStats.off_chain_balance.toFixed(2)}</span>
          <span className="text-gaming-text-secondary">credits</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-xs text-gaming-text-secondary">
        <span>{userStats.rating} ELO</span>
        <span className="text-gaming-text-secondary">•</span>
        <span>{userStats.matches_won}-{userStats.matches_lost}</span>
      </div>
    </div>
  );
};