import { formatDistanceToNow } from 'date-fns';
import { Swords, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import AvatarPreview from '../profile/AvatarPreview';
import { Inventory } from '@/types/game';
import { useState } from 'react';

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
    losses: number;
    current_streak: number;
    last_game_pending: boolean;
    last_game_timestamp: string;
    match_history: {
      created_at: string;
      winner_did: string;
      status: string;
    }[];
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
  inventory,
  stakeAmount
}: PlayerCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

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
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gaming-text-secondary">
                {player.wins} - {player.losses}
              </span>
            </div>
          </div>
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gaming-text-secondary hover:text-gaming-text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <UserPlus className="h-5 w-5" />
        </Button>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDetails(!showDetails);
        }}
        className="w-full mt-2 flex items-center justify-center gap-1 text-sm text-gaming-text-secondary hover:text-gaming-text-primary"
      >
        {/* {showDetails ? 'Hide Details' : 'Show Details'} */}
        {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Match history section - now conditionally rendered */}
      {showDetails && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gaming-text-secondary">Match History</h4>
          <div className="space-y-1">
            {player.match_history?.map((match, index) => (
              <div 
                key={index}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gaming-text-secondary">
                  {formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}
                </span>
                <span className={cn(
                  "font-medium",
                  match.status === 'pending' ? 'text-gaming-warning' : 
                  match.winner_did === player.did ? 'text-gaming-success' : 'text-gaming-error'
                )}>
                  {match.status === 'pending' ? 'Pending' : 
                   match.winner_did === player.did ? 'Won' : 'Lost'}
                </span>
              </div>
            ))}
            {(!player.match_history || player.match_history.length === 0) && (
              <div className="text-sm text-gaming-text-secondary">
                No matches played yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 