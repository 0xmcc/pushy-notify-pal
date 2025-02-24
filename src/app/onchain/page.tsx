import React, { useEffect } from 'react';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { useRPS } from '@/providers/RPSProvider';
import { RPSTestingInterface } from './components/RPSTestingInterface';
import { RPSProviderStatus } from './components/RPSProviderStatus';

const OnChainGamesPage = () => {
  const { program, isLoading, error } = useRPS();
  const { wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];
  
  useEffect(() => {
    console.log("[OnChainGamesPage] State changed:", {
      programExists: !!program,
      programDetails: program,
      isLoading,
      walletConnected: !!solanaWallet?.address,
    });
  }, [program, isLoading, solanaWallet?.address]);

  console.log("[OnChainGamesPage] Rendering");

  try {
    const rps = useRPS();
    console.log("[OnChainGamesPage] RPS context:", !!rps);
  } catch (e) {
    console.log("[OnChainGamesPage] Error accessing context:", e);
  }

  if (isLoading) {
    return <div>Loading RPS program...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gaming-text mb-6">On-Chain Games</h1>
      
      {/* Status Indicators */}
      <RPSProviderStatus 
        program={program}
        solanaWallet={solanaWallet}
      />

      {/* Testing Interface */}
      <RPSTestingInterface />
    </div>
  );
};

export default OnChainGamesPage; 
