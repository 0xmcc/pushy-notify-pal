import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getWalletDisplayName } from '../utils';

interface GameActionsSectionProps {
  betAmount: string;
  setBetAmount: (amount: string) => void;
  handleCreateGame: () => Promise<any>;
  handleCreateGameAndCommit: () => Promise<void>;
  handleJoinGame: () => Promise<void>;
  handleFetchGameState: () => Promise<void>;
  gamePublicKey: string;
  setGamePublicKey: (key: string) => void;
  isLoading: boolean;
  program: any; // Replace with proper program type
  selectedMove: string;
  activeWallet: 'real' | 'test';
}

export const GameActionsSection = ({
  betAmount,
  setBetAmount,
  handleCreateGame,
  handleCreateGameAndCommit,
  handleJoinGame,
  handleFetchGameState,
  gamePublicKey,
  setGamePublicKey,
  isLoading,
  program,
  selectedMove,
  activeWallet
}: GameActionsSectionProps) => {
  return (
    <div className="border border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-semibold">Step 2: Create or Join a Game</h4>
        <span className="text-sm text-gray-400">
          Using: {getWalletDisplayName(activeWallet)}
        </span>
      </div>
      <div className="space-y-4">
        {/* Create Game Section */}
        <div>
          <p className="text-gray-400 mb-2">Create a new game by setting a bet amount:</p>
          <div className="space-y-2">
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Bet amount in SOL"
              className="w-full bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-gaming-accent focus:border-gaming-accent"
            />
            <div className="flex space-x-2">
              <Button 
                onClick={handleCreateGame}
                disabled={isLoading || !program}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Create Game Only
              </Button>
              <Button 
                onClick={handleCreateGameAndCommit}
                disabled={isLoading || !program || !selectedMove}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Create & Commit Move
              </Button>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">OR</span>
          </div>
        </div>

        {/* Join Game Section */}
        <div>
          <p className="text-gray-400 mb-2">Join an existing game by entering its public key:</p>
          <div className="space-y-2">
            <Input
              value={gamePublicKey}
              onChange={(e) => setGamePublicKey(e.target.value)}
              placeholder="Paste Game Public Key"
              className="w-full bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-gaming-accent focus:border-gaming-accent"
            />
            <div className="flex space-x-2">
              <Button 
                onClick={handleJoinGame}
                disabled={isLoading || !program || !gamePublicKey}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Join Game
              </Button>
              <Button 
                onClick={() => handleFetchGameState()}
                disabled={!program || !gamePublicKey}
                className="flex-1"
              >
                Check Game Status
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 