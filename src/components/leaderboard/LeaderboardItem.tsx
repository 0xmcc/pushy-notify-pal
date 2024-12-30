import { Trophy, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LeaderboardItemProps {
  player: {
    did: string;
    display_name: string | null;
    avatar_url: string | null;
    rating: number;
  };
  index: number;
}

export const LeaderboardItem = ({ player, index }: LeaderboardItemProps) => {
  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg transition-all duration-300",
        "bg-gaming-accent/10 hover:bg-gaming-accent/20",
        "border border-gaming-accent/30 hover:border-gaming-accent/50",
        "group/player relative overflow-hidden"
      )}
    >
      {index < 3 && (
        <div className="absolute top-0 right-0 p-1">
          <Sparkles className="w-4 h-4 text-gaming-warning animate-pulse" />
        </div>
      )}
      
      <span className={cn(
        "text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full",
        index === 0 && "bg-yellow-500/20 text-yellow-500",
        index === 1 && "bg-gray-300/20 text-gray-300",
        index === 2 && "bg-amber-600/20 text-amber-600",
        index > 2 && "bg-gaming-accent/20 text-gaming-text-secondary"
      )}>
        #{index + 1}
      </span>
      
      <Avatar className={cn(
        "h-10 w-10 border-2 transition-all duration-300",
        "group-hover/player:scale-110",
        index === 0 && "border-yellow-500 ring-2 ring-yellow-500/20",
        index === 1 && "border-gray-300 ring-2 ring-gray-300/20",
        index === 2 && "border-amber-600 ring-2 ring-amber-600/20",
        index > 2 && "border-gaming-accent"
      )}>
        <AvatarImage 
          src={player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.did}`} 
          alt={player.display_name || player.did} 
        />
        <AvatarFallback>
          {(player.display_name || player.did).slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <p className="font-medium text-gaming-text-primary group-hover/player:text-white transition-colors">
          {player.display_name || player.did}
        </p>
        <p className="text-sm text-gaming-text-secondary flex items-center gap-2">
          <span className="font-mono">{player.rating}</span>
          <span className="text-xs text-gaming-accent">ELO</span>
        </p>
      </div>
    </div>
  );
};