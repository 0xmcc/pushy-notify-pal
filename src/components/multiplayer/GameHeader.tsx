import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface GameHeaderProps {
  playerDid: string;
  playerName?: string;
  playerRating?: number;
  stakeAmount: number;
}

export const GameHeader = ({ playerDid, playerName, playerRating, stakeAmount }: GameHeaderProps) => {
  const fallbackAvatar = "/placeholder.svg";

  return (
    <div className="flex items-center gap-4 mb-6">
      <Avatar className="h-12 w-12 border-2 border-gaming-accent">
        <AvatarImage 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${playerDid}`}
          onError={(e) => {
            console.log("Avatar image failed to load, using fallback");
            (e.target as HTMLImageElement).src = fallbackAvatar;
          }}
        />
        <AvatarFallback>
          {playerName?.slice(0, 2).toUpperCase() || 'XX'}
        </AvatarFallback>
      </Avatar>
      <div>
        <h3 className="text-lg font-bold text-gaming-text-primary">
          {playerName || playerDid}
        </h3>
        <p className="text-gaming-text-secondary flex items-center gap-2">
          <span>{playerRating || 1200} ELO</span>
          <span className="text-gaming-accent">•</span>
          <span>{stakeAmount} SOL</span>
        </p>
      </div>
    </div>
  );
};