import { Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

interface RPSProviderStatusProps {
  program: Program | null;
  solanaWallet: {
    address: string;
  } | null;
}

export const RPSProviderStatus = ({ program, solanaWallet }: RPSProviderStatusProps) => {
  return (
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
            {program && (
              <span className="ml-2 text-sm text-gray-400">
                {`${program.programId.toString()}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 