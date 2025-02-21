import React from 'react';
import { useRPS } from '@/providers/RPSProvider';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { RPSContext } from '@/providers/RPSProvider';

const OnChainGamesPage = () => {
  const { program, isLoading, error } = useRPS();
  const { wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];
  console.log("[OnChainGamesPage] Rendering");
  const contextValue = React.useContext(RPSContext);
  console.log("[OnChainGamesPage] Context value:", !!contextValue);
  try {
    const rps = useRPS();
    console.log("[OnChainGamesPage] RPS context:", !!rps);
  } catch (e) {
    console.log("[OnChainGamesPage] Error accessing context:", e);
  }

  if (isLoading) {
    return <div>Loading RPS program...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gaming-text mb-6">On-Chain Games</h1>
      
      {/* Status Indicators */}
      <div className="mb-8 space-y-4">
        <div className="p-4 rounded-lg bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">RPS Provider Status</h2>
          
          <div className="space-y-2">
            {/* Wallet Status */}
            <div className="flex items-center">
              <span className="mr-2">Wallet Status:</span>
              <span className={`px-2 py-1 rounded ${solanaWallet?.address ? 'bg-green-600' : 'bg-red-600'}`}>
                {solanaWallet?.address ? 'Connected' : 'Not Connected'}
              </span>
              {solanaWallet?.address && (
                <span className="ml-2 text-sm text-gray-400">
                  {`${solanaWallet.address.slice(0, 4)}...${solanaWallet.address.slice(-4)}`}
                </span>
              )}
            </div>

            {/* Program Status */}
            <div className="flex items-center">
              <span className="mr-2">Program Status:</span>
              <span className={`px-2 py-1 rounded ${program ? 'bg-green-600' : 'bg-red-600'}`}>
                {program ? 'Initialized' : 'Not Initialized'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Game content will be added here */}
      </div>
    </div>
  );
};

export default OnChainGamesPage; 