import { Button } from '@/components/ui/button';
import { getWalletDisplayName } from '../utils';

interface CreatePlayerSectionProps {
  handleCreatePlayer: () => Promise<void>;
  isLoading: boolean;
  program: any; // Replace with proper program type
  activeWallet: 'real' | 'test';
}

export const CreatePlayerSection = ({
  handleCreatePlayer,
  isLoading,
  program,
  activeWallet,
}: CreatePlayerSectionProps) => {
  return (
    <div className="border border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-semibold">Step 1: Create Player Account</h4>
        <span className="text-sm text-gray-400">
          Using: {getWalletDisplayName(activeWallet)}
        </span>
      </div>
      <p className="text-gray-400 mb-4">
        First, create your player account on the blockchain. This only needs to be done once.
      </p>
      <Button 
        onClick={handleCreatePlayer}
        disabled={isLoading || !program}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        Create Player Account
      </Button>
    </div>
  );
}; 