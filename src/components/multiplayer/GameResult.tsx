'use client';

import { DollarSign } from "lucide-react";
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
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-8">
        <div className={cn(
          "p-1 rounded-full",
          isUserWinner && isUserPlayer1 || !isUserWinner && isUserPlayer2 ? "bg-green-500/10" : "bg-red-500/10"
        )}>
          <GameMoveDisplay 
            move={player1Move} 
            isWinner={winner_did === player1_did}
          />
        </div>
        <span className="text-2xl font-bold text-gaming-text-primary">VS</span>
        <div className={cn(
          "p-1 rounded-full",
          isUserWinner && isUserPlayer2 || !isUserWinner && isUserPlayer1 ? "bg-green-500/10" : "bg-red-500/10"
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
          className="w-full py-2 px-4 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <DollarSign className="w-4 h-4" />
          <span>Claim {stakeAmount * 2} SOL</span>
        </button>
      )}
    </div>
  );
};