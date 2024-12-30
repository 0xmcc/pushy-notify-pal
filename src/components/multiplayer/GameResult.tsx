'use client';

import { Trophy } from "lucide-react";
import { GameMoveDisplay } from "./GameMoveDisplay";
import { cn } from "@/lib/utils";

interface GameResultProps {
  player1Move: string | null;
  player2Move: string | null;
  isUserPlayer1: boolean;
  isUserPlayer2: boolean;
  isUserWinner: boolean;
  winner_did: string | null;
  player1_did: string;
  player2_did: string | null;
  stakeAmount: number;
  canClaim: boolean;
  onClaim: (gameId: string, move: string) => Promise<void>;
  gameId: string;
}

export const GameResult = ({
  player1Move,
  player2Move,
  isUserPlayer1,
  isUserPlayer2,
  isUserWinner,
  winner_did,
  player1_did,
  player2_did,
  stakeAmount,
  canClaim,
  onClaim,
  gameId,
}: GameResultProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-8">
        <div className={cn(
          "p-4 rounded-xl transition-all duration-300",
          "bg-gaming-accent/10 backdrop-blur-sm",
          "border border-gaming-accent/30",
          winner_did === player1_did && "bg-gaming-primary/10 border-gaming-primary/30",
          winner_did === player2_did && "bg-gaming-secondary/10 border-gaming-secondary/30"
        )}>
          <GameMoveDisplay 
            move={player1Move} 
            isWinner={winner_did === player1_did}
          />
        </div>
        
        <span className="text-2xl font-bold bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent">
          VS
        </span>
        
        <div className={cn(
          "p-4 rounded-xl transition-all duration-300",
          "bg-gaming-accent/10 backdrop-blur-sm",
          "border border-gaming-accent/30",
          winner_did === player2_did && "bg-gaming-primary/10 border-gaming-primary/30",
          winner_did === player1_did && "bg-gaming-secondary/10 border-gaming-secondary/30"
        )}>
          <GameMoveDisplay 
            move={player2Move} 
            isWinner={winner_did === player2_did}
          />
        </div>
      </div>
      
      {canClaim && (
        <button
          onClick={() => onClaim(gameId, 'claim')}
          className={cn(
            "w-full py-3 px-6",
            "bg-gaming-primary/20 hover:bg-gaming-primary/30",
            "border border-gaming-primary/50 hover:border-gaming-primary",
            "rounded-lg",
            "flex items-center justify-center gap-3",
            "transition-all duration-300",
            "group"
          )}
        >
          <Trophy className="w-5 h-5 text-gaming-primary group-hover:scale-110 transition-transform" />
          <span className="text-gaming-primary font-semibold">
            Claim {stakeAmount * 2} SOL
          </span>
        </button>
      )}
    </div>
  );
};