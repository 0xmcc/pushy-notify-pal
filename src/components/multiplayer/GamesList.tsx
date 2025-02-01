import { Game } from "@/types/game";
import { GameCard } from "./game-card/GameCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface GamesListProps {
  games: Game[];
  isOffline: boolean;
  onPlayMove: (gameId: string, move: string) => Promise<void>;
}

export const GamesList = ({ games, isOffline, onPlayMove }: GamesListProps) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-4 text-gaming-text-secondary">
        {isOffline ? "No games available offline" : "No active games available"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isOffline && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are currently offline. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}
      {games.map((game) => (
        <GameCard 
          key={game.id} 
          game={game} 
          onPlayMove={onPlayMove}
        />
      ))}
    </div>        
  );
};