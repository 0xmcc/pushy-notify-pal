import { formatDistanceToNow } from 'date-fns';
import { Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import AvatarPreview from '../profile/AvatarPreview';

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
}

export const PlayerCard = ({ player, isSelected, onClick }: PlayerCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-lg bg-gaming-card hover:bg-gaming-accent/20 transition-all",
        "flex items-center gap-4",
        isSelected && "border border-gaming-primary"
      )}
    >
      <div className="relative">
        <AvatarPreview 
          previewUrl={null}
          avatarUrl={player.avatar_url}
          size="md"
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
          <span className="text-xs text-gaming-text-secondary">
            {player.last_game_timestamp && 
              formatDistanceToNow(new Date(player.last_game_timestamp), { addSuffix: true })}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gaming-text-secondary">
            {player.rating} ELO
          </span>
          <span className="text-xs text-gaming-text-secondary">•</span>
          <span className="text-sm text-gaming-text-secondary">
            {player.wins}/{player.games_played} W
          </span>
          {player.current_streak > 0 && (
            <>
              <span className="text-xs text-gaming-text-secondary">•</span>
              <span className="text-sm text-gaming-warning">
                {player.current_streak} streak
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}; 