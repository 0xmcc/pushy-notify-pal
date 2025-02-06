import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

const MOVES = [
  {
    id: '0',
    name: 'Rock',
    icon: '🪨',
    beats: 'Scissors',
    countKey: 'rock_count' as const
  },
  {
    id: '1',
    name: 'Paper',
    icon: '📄',
    beats: 'Rock',
    countKey: 'paper_count' as const
  },
  {
    id: '2',
    name: 'Scissors',
    icon: '✂️',
    beats: 'Paper',
    countKey: 'scissors_count' as const
  }
];

export const GameMoveSelector = ({ selectedMove, onMoveSelect, inventory, stakeAmount }: GameMoveSelectorProps) => {
    // Add an effect to log inventory changes
    useEffect(() => {
      console.log('GameMoveSelector - inventory updated:', inventory);
    }, [inventory]);
  return (
    <div className="flex justify-center gap-4">
      {MOVES.map((move) => (
        <Tooltip key={move.id}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={() => onMoveSelect(move.id)}
              disabled={inventory[move.countKey] === 0}
              className={`
                relative h-24 w-28 
                rounded-lg border-2 
                flex flex-col items-center justify-center gap-3 p-2
                transition-all duration-200 
                text-white hover:text-gaming-accent
                ${selectedMove === move.id 
                  ? 'border-gaming-success bg-gaming-success/10' 
                  : 'border-slate-700 hover:border-gaming-accent'
                }
                ${inventory[move.countKey] === 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105'
                }
              `}
            >
              {/* Move Icon */}
              <span className="text-4xl transform group-hover:scale-110 transition-transform">
                {move.icon}
              </span>
              
              {/* Move Name and Count */}
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {move.name}
                </span>
                <span className="text-sm font-bold">
                  {inventory[move.countKey]}
                </span>
              </div>

              {/* Selection Effects */}
              {selectedMove === move.id && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-1/2 w-px h-8 bg-gradient-to-b from-gaming-success/0 via-gaming-success/30 to-gaming-success/0 animate-glow" />
                  <div className="absolute bottom-0 left-1/2 w-px h-8 bg-gradient-to-t from-gaming-success/0 via-gaming-success/30 to-gaming-success/0 animate-glow" />
                </div>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Beats {move.beats}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};