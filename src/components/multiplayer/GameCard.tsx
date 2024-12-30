import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LockIcon } from "lucide-react";
import { GameActions } from "./GameActions";
import { Game } from "@/types/game";
import { usePrivy } from "@privy-io/react-auth";

interface GameCardProps {
  game: Game;
  onPlayMove: (gameId: string, move: string) => Promise<void>;
}

export const GameCard = ({ game, onPlayMove }: GameCardProps) => {
  const { user, authenticated } = usePrivy();
  const fallbackAvatar = "/placeholder.svg";

  return (
    <div className="relative border border-gaming-accent rounded-lg p-6 bg-gaming-card/80 backdrop-blur-sm hover:bg-gaming-card/90 transition-all">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-12 w-12 border-2 border-gaming-accent">
          <AvatarImage 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${game.player1_did}`}
            onError={(e) => {
              console.log("Avatar image failed to load, using fallback");
              (e.target as HTMLImageElement).src = fallbackAvatar;
            }}
          />
          <AvatarFallback>
            {game.creator_name?.slice(0, 2).toUpperCase() || 'XX'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-bold text-gaming-text-primary">
            {game.creator_name || game.player1_did}
          </h3>
          <p className="text-gaming-text-secondary flex items-center gap-2">
            <span>{game.creator_rating || 1200} ELO</span>
            <span className="text-gaming-accent">•</span>
            <span>{game.stake_amount} SOL</span>
          </p>
        </div>
        <div className="absolute right-6 top-6">
          <LockIcon className="w-8 h-8 text-gaming-accent opacity-50" />
        </div>
      </div>
      
      <GameActions 
        game={game}
        onPlayMove={onPlayMove}
        authenticated={authenticated}
        userId={user?.id}
      />
    </div>
  );
};