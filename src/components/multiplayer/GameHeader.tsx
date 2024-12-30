import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Coins } from "lucide-react";

interface GameHeaderProps {
  playerDid: string;
  playerName?: string;
  playerRating?: number;
  stakeAmount: number;
}

export const GameHeader = ({ playerDid, playerName, playerRating, stakeAmount }: GameHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-gaming-accent/30 ring-2 ring-gaming-accent/10">
          <AvatarImage 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${playerDid}`}
            className="object-cover"
          />
          <AvatarFallback>
            {playerName?.slice(0, 2).toUpperCase() || 'XX'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-bold text-white">
            {playerName || playerDid.slice(0, 8)}
          </h3>
          <p className="text-gaming-text-secondary text-sm">
            {playerRating || 1200} ELO
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gaming-accent/10 border border-gaming-accent/20">
        <Coins className="w-4 h-4 text-gaming-warning" />
        <span className="text-gaming-warning font-medium">{stakeAmount} SOL</span>
      </div>
    </div>
  );
};