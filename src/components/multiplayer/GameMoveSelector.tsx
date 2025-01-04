import { Button } from "@/components/ui/button";
import { useEffect } from "react";
interface GameMoveSelectorProps {
  selectedMove: string;
  onMoveSelect: (move: string) => void;
  inventory: {
    rock_count: number;
    paper_count: number;
    scissors_count: number;
  };
  stakeAmount: number;
}

export const GameMoveSelector = ({ selectedMove, onMoveSelect, inventory, stakeAmount }: GameMoveSelectorProps) => {
    // Add an effect to log inventory changes
    useEffect(() => {
      console.log('GameMoveSelector - inventory updated:', inventory);
    }, [inventory]);
  return (
    <div className="flex justify-center gap-4">
      <Button
        variant="ghost"
        className={`hover:bg-gaming-accent/20 text-3xl h-16 w-16 rounded-xl transition-all duration-200 transform hover:scale-110 text-gaming-text-primary disabled:opacity-50 disabled:cursor-not-allowed ${selectedMove === '0' ? 'bg-gaming-accent/80' : ''}`}
        onClick={() => onMoveSelect('0')}
        disabled={inventory.rock_count === 0}
      >
        🪨 <span className="text-sm ml-1">{inventory.rock_count}</span>
      </Button>
      <Button
        variant="ghost"
        className={`hover:bg-gaming-accent/20 text-3xl h-16 w-16 rounded-xl transition-all duration-200 transform hover:scale-110 text-gaming-text-primary disabled:opacity-50 disabled:cursor-not-allowed ${selectedMove === '1' ? 'bg-gaming-accent/20' : ''}`}
        onClick={() => onMoveSelect('1')}
        disabled={inventory.paper_count === 0}
      >
        📄 <span className="text-sm ml-1">{inventory.paper_count}</span>
      </Button>
      <Button
        variant="ghost"
        className={`hover:bg-gaming-accent/20 text-3xl h-16 w-16 rounded-xl transition-all duration-200 transform hover:scale-110 text-gaming-text-primary disabled:opacity-50 disabled:cursor-not-allowed ${selectedMove === '2' ? 'bg-gaming-accent/20' : ''}`}
        onClick={() => onMoveSelect('2')}
        disabled={inventory.scissors_count === 0}
      >
        ✂️ <span className="text-sm ml-1">{inventory.scissors_count}</span>
      </Button>
    </div>
  );
};