import { Game } from "@/types/game";
import { cn } from "@/lib/utils";

interface GameActionsProps {
  game: Game;
  onPlayMove: (gameId: string, move: string) => Promise<void>;
  authenticated: boolean;
  userId?: string;
}

export const GameActions = ({ game, onPlayMove, authenticated, userId }: GameActionsProps) => {
  const canPlay = authenticated && game.player1_did !== userId && !game.player2_did;
  
  const moves = [
    { value: '0', label: '🪨', name: 'Rock' },
    { value: '1', label: '📄', name: 'Paper' },
    { value: '2', label: '✂️', name: 'Scissors' }
  ];
  
  return (
    <div className="grid grid-cols-3 gap-3">
      {moves.map(({ value, label, name }) => (
        <button
          key={value}
          onClick={() => onPlayMove(game.id, value)}
          disabled={!canPlay}
          className={cn(
            "relative group px-4 py-3 rounded-lg",
            "bg-gaming-accent/20 hover:bg-gaming-accent/30",
            "transition-all duration-300",
            "border border-gaming-accent/50 hover:border-gaming-accent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "before:absolute before:inset-0",
            "before:bg-gradient-to-b before:from-gaming-primary/10 before:to-transparent",
            "before:opacity-0 before:transition-opacity before:duration-300",
            "hover:before:opacity-100",
            "disabled:before:opacity-0"
          )}
        >
          <div className="relative z-10 space-y-2">
            <span className="block text-center text-4xl group-hover:scale-110 transition-transform duration-300">
              {label}
            </span>
            <span className="block text-sm text-center text-gaming-text-secondary group-hover:text-white transition-colors">
              {!authenticated 
                ? "Sign in to Play" 
                : game.player1_did === userId 
                  ? "Your Game" 
                  : game.player2_did 
                    ? "Game in Progress"
                    : name}
            </span>
          </div>
          
          {/* Hover effect border */}
          <div className="absolute inset-0 border border-gaming-primary/0 group-hover:border-gaming-primary/30 rounded-lg transition-colors duration-300" />
        </button>
      ))}
    </div>
  );
};