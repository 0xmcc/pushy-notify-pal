import { cn } from "@/lib/utils";
import { GameMoveDisplay } from "./GameMoveDisplay";

interface GameMoveComparisonProps {
  player1Move: string | null;
  player2Move: string | null;
  isDraw: boolean;
  winner_did: string | null;
  player1_did: string;
  player2_did: string | null;
}

export const GameMoveComparison = ({
  player1Move,
  player2Move,
  isDraw,
  winner_did,
  player1_did,
  player2_did,
}: GameMoveComparisonProps) => {
  return (
    <div className="flex items-center justify-center gap-8">
      <div className={cn(
        "p-4 rounded-full transition-all duration-300",
        isDraw ? "bg-gaming-accent/10 ring-2 ring-gaming-accent/20" :
        winner_did === player1_did ? "bg-gaming-success/10 ring-2 ring-gaming-success/20" : 
        winner_did === player2_did ? "bg-gaming-danger/10 ring-2 ring-gaming-danger/20" : 
        "bg-gaming-accent/10"
      )}>
        <GameMoveDisplay 
          move={player1Move} 
          isWinner={winner_did === player1_did}
          isDraw={isDraw}
        />
      </div>
      <span className="text-2xl font-bold text-gaming-text-secondary">VS</span>
      <div className={cn(
        "p-4 rounded-full transition-all duration-300",
        isDraw ? "bg-gaming-accent/10 ring-2 ring-gaming-accent/20" :
        winner_did === player2_did ? "bg-gaming-success/10 ring-2 ring-gaming-success/20" : 
        winner_did === player1_did ? "bg-gaming-danger/10 ring-2 ring-gaming-danger/20" : 
        "bg-gaming-accent/10"
      )}>
        <GameMoveDisplay 
          move={player2Move} 
          isWinner={winner_did === player2_did}
          isDraw={isDraw}
        />
      </div>
    </div>
  );
};