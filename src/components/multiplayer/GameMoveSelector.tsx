import { Button } from "@/components/ui/button";

interface GameMoveSelectorProps {
  selectedMove: string;
  onMoveSelect: (move: string) => void;
  inventory: {
    rock: number;
    paper: number;
    scissors: number;
  };
  stakeAmount: number;
}

export const GameMoveSelector = ({ selectedMove, onMoveSelect, inventory, stakeAmount }: GameMoveSelectorProps) => {
  return (
    <div className="flex justify-center gap-4">
      <Button
        variant="ghost"
        className={`hover:bg-gaming-accent/20 text-3xl h-16 w-16 rounded-xl transition-all duration-200 transform hover:scale-110 text-gaming-text-primary disabled:opacity-50 disabled:cursor-not-allowed ${selectedMove === '0' ? 'bg-gaming-accent/20' : ''}`}
        onClick={() => onMoveSelect('0')}
        disabled={inventory.rock === 0}
      >
        🪨 <span className="text-sm ml-1">{inventory.rock}</span>
      </Button>
      <Button
        variant="ghost"
        className={`hover:bg-gaming-accent/20 text-3xl h-16 w-16 rounded-xl transition-all duration-200 transform hover:scale-110 text-gaming-text-primary disabled:opacity-50 disabled:cursor-not-allowed ${selectedMove === '1' ? 'bg-gaming-accent/20' : ''}`}
        onClick={() => onMoveSelect('1')}
        disabled={inventory.paper === 0}
      >
        📄 <span className="text-sm ml-1">{inventory.paper}</span>
      </Button>
      <Button
        variant="ghost"
        className={`hover:bg-gaming-accent/20 text-3xl h-16 w-16 rounded-xl transition-all duration-200 transform hover:scale-110 text-gaming-text-primary disabled:opacity-50 disabled:cursor-not-allowed ${selectedMove === '2' ? 'bg-gaming-accent/20' : ''}`}
        onClick={() => onMoveSelect('2')}
        disabled={inventory.scissors === 0}
      >
        ✂️ <span className="text-sm ml-1">{inventory.scissors}</span>
      </Button>
    </div>
  );
};