import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getWalletDisplayName } from '../utils';

interface MoveActionsSectionProps {
  selectedMove: string;
  setSelectedMove: (move: string) => void;
  handleCommitMove: () => Promise<void>;
  handleRevealMove: () => Promise<void>;
  isLoading: boolean;
  program: any; // Replace with proper program type
  gamePublicKey: string;
  activeWallet: 'real' | 'test';
}

export const MoveActionsSection = ({
  selectedMove,
  setSelectedMove,
  handleCommitMove,
  handleRevealMove,
  isLoading,
  program,
  gamePublicKey,
  activeWallet
}: MoveActionsSectionProps) => {
  return (
    <div className="border border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-semibold">Step 3: Make Your Move</h4>
        <span className="text-sm text-gray-400">
          Using: {getWalletDisplayName(activeWallet)}
        </span>
      </div>
      <p className="text-gray-400 mb-4">
        The game uses a commit-reveal scheme for fairness:
        <br/>1. First, commit your move (it will be encrypted)
        <br/>2. After both players commit, reveal your move
      </p>

      <div className="space-y-4">
        <Select onValueChange={setSelectedMove} value={selectedMove}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white focus:ring-gaming-accent focus:border-gaming-accent">
            <SelectValue placeholder="Choose: Rock, Paper, or Scissors" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600 text-white">
            <SelectItem value="0" className="focus:bg-gray-600 focus:text-white">Rock</SelectItem>
            <SelectItem value="1" className="focus:bg-gray-600 focus:text-white">Paper</SelectItem>
            <SelectItem value="2" className="focus:bg-gray-600 focus:text-white">Scissors</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex space-x-2">
          <Button 
            onClick={() => handleCommitMove()}
            disabled={isLoading || !program || !gamePublicKey || !selectedMove}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700"
          >
            1. Commit Move
          </Button>
          <Button 
            onClick={handleRevealMove}
            disabled={isLoading || !program || !gamePublicKey || !selectedMove}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            2. Reveal Move
          </Button>
        </div>
      </div>
    </div>
  );
}; 