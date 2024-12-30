'use client';

import { Coins } from "lucide-react";
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
          "p-4 rounded-full transition-all duration-300",
          winner_did === player1_did ? "bg-gaming-success/10 ring-2 ring-gaming-success/20" : 
          winner_did === player2_did ? "bg-gaming-danger/10 ring-2 ring-gaming-danger/20" : 
          "bg-gaming-accent/10"
        )}>
          <GameMoveDisplay 
            move={player1Move} 
            isWinner={winner_did === player1_did}
          />
        </div>
        <span className="text-2xl font-bold text-gaming-text-secondary">VS</span>
        <div className={cn(
          "p-4 rounded-full transition-all duration-300",
          winner_did === player2_did ? "bg-gaming-success/10 ring-2 ring-gaming-success/20" : 
          winner_did === player1_did ? "bg-gaming-danger/10 ring-2 ring-gaming-danger/20" : 
          "bg-gaming-accent/10"
        )}>
          <GameMoveDisplay 
            move={player2Move} 
            isWinner={winner_did === player2_did}
          />
        </div>
      </div>
      
      {isUserWinner && (
        <div className="text-center space-y-3">
          <p className="text-gaming-success text-xl font-bold animate-pulse">
            You won!
          </p>
        </div>
      )}
      
      {canClaim && (
        <button
          onClick={() => onClaim(gameId, 'claim')}
          className="w-full py-3 px-4 bg-gaming-success/10 hover:bg-gaming-success/20 
                     text-gaming-success border border-gaming-success/20 rounded-lg 
                     flex items-center justify-center gap-2 transition-all duration-300
                     hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <Coins className="w-5 h-5" />
          <span className="font-medium">Claim {stakeAmount * 2} SOL</span>
        </button>
      )}
    </div>
  );
};