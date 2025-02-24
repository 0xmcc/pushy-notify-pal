import { WalletType } from '../types';
import { getWalletDisplayName, getShortAddress } from '../utils';
import { PublicKey, Keypair } from '@solana/web3.js';

interface WalletSwitcherProps {
  activeWallet: 'real' | 'test';
  setActiveWallet: (type: 'real' | 'test') => void;
  walletBalances: Record<string, number>;
  playerAccountsExist: {[key: string]: boolean};
  solanaWallet: any; // Replace with proper wallet type
  playerTwo: {
    publicKey: PublicKey;
    keypair: Keypair;
  };
}

export const WalletSwitcher = ({
  activeWallet,
  setActiveWallet,
  walletBalances,
  playerAccountsExist,
  solanaWallet,
  playerTwo
}: WalletSwitcherProps) => {
  return (
    <div className="border border-gray-700 rounded-lg p-4 mb-8">
      <h4 className="text-lg font-semibold mb-4">Active Wallet</h4>
      <div className="grid grid-cols-2 gap-4">
        {(['real', 'test'] as const).map((walletType) => {
          const isActive = activeWallet === walletType;
          const currentWallet = walletType === 'test' ? 
            { type: 'test' as const, publicKey: playerTwo.publicKey, keypair: playerTwo } :
            (solanaWallet ? { type: 'real' as const, address: solanaWallet.address } : null);
          const balance = walletBalances[walletType] || 0;
          const hasPlayerAccount = playerAccountsExist[walletType];
          
          return (
            <div 
              key={walletType}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all
                ${isActive 
                  ? 'border-gaming-accent bg-gray-700' 
                  : 'border-gray-600 hover:border-gray-500'}`}
              onClick={() => setActiveWallet(walletType)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{getWalletDisplayName(walletType)}</span>
                {isActive && (
                  <span className="px-2 py-1 text-xs bg-gaming-accent rounded-full">Active</span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                {getShortAddress(currentWallet)}
              </div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{balance.toFixed(2)} SOL</span>
                  {walletType !== 'real' && (
                    <span className="text-xs text-gray-400">Pre-funded Test Wallet</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${hasPlayerAccount ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs text-gray-400">
                    {hasPlayerAccount ? 'Player Account Created' : 'No Player Account'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 