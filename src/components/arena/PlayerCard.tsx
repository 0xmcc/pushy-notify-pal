import { formatDistanceToNow } from 'date-fns';
import { Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import AvatarPreview from '../profile/AvatarPreview';
import { Inventory } from '@/types/game';

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

interface PlayerCardProps {
  player: {
    did: string;
    display_name: string;
    avatar_url: string;
    rating: number;
    games_played: number;
    wins: number;
    current_streak: number;
    last_game_pending: boolean;
    last_game_timestamp: string;
  };
  isSelected: boolean;
  onClick: () => void;
  showMoveSelector?: boolean;
  selectedMove?: string;
  onMoveSelect?: (move: string) => void;
  inventory: Inventory;
  stakeAmount: number;
}

export const PlayerCard = ({ 
  player, 
  isSelected, 
  onClick,
  showMoveSelector,
  selectedMove = '',
  onMoveSelect,
  inventory,
  stakeAmount
}: PlayerCardProps) => {
  return (
    <div className={cn(
      "w-full p-4 rounded-lg bg-gaming-card hover:bg-gaming-accent/20 transition-all",
      isSelected && "border border-gaming-primary"
    )}>
      <div className="flex items-center justify-between">
        <button
          onClick={onClick}
          className="flex items-center gap-4"
        >
          <div className="relative">
            <AvatarPreview 
              previewUrl={null}
              avatarUrl={player.avatar_url}
              size="xs"
            />
            {player.last_game_pending && (
              <div className="absolute -top-1 -right-1">
                <Swords className="w-4 h-4 text-gaming-warning" />
              </div>
            )}
          </div>

          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gaming-text-primary">
                {player.display_name}
              </h3>
              {/* <span className="text-xs text-gaming-text-secondary">
                {player.last_game_timestamp && 
                  formatDistanceToNow(new Date(player.last_game_timestamp), { addSuffix: true })}
              </span> */}
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gaming-text-secondary">
                {player.wins} - {player.games_played} 
              </span>
              {/* {player.current_streak > 0 && (
                <>
                  <span className="text-xs text-gaming-text-secondary">•</span>
                  <span className="text-sm text-gaming-warning">
                    {player.current_streak} streak
                  </span>
                </>
              )} */}
            </div>
          </div>
        </button>

        {showMoveSelector && onMoveSelect && (
          <div className="flex flex-col gap-2 ml-4">
            <div className="flex justify-center gap-4">
              {MOVES.map((move) => (
                <Tooltip key={move.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => onMoveSelect(move.id)}
                      disabled={inventory[move.countKey] === 0}
                      className={`
                        relative h-12 w-12 
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
                      <span className="text-1xl transform group-hover:scale-110 transition-transform">
                        {move.icon}
                      </span>
                      
                      {/* Move Name and Count
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {move.name}
                        </span>
                        <span className="text-sm font-bold">
                          {inventory[move.countKey]}
                        </span>
                      </div> */}

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
          </div>
        )}
      </div>
    </div>
  );
}; 