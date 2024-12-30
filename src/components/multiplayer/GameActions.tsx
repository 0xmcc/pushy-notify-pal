import { Game } from "@/types/game";

interface GameActionsProps {
  game: Game;
  onPlayMove: (gameId: string, move: string) => Promise<void>;
  authenticated: boolean;
  userId?: string;
}

export const GameActions = ({ game, onPlayMove, authenticated, userId }: GameActionsProps) => {
  const canPlay = authenticated && game.player1_did !== userId && !game.player2_did;
  
  const moves = [
    { value: '0', label: '🪨' },
    { value: '1', label: '📄' },
    { value: '2', label: '✂️' }
  ];
  
  return (
    <div className="grid grid-cols-3 gap-3">
      {moves.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onPlayMove(game.id, value)}
          disabled={!canPlay}
          className="relative group px-4 py-3 rounded-lg bg-gaming-accent/20 hover:bg-gaming-accent/30 transition-colors border border-gaming-accent/50 hover:border-gaming-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute -top-3 -right-3 w-6 h-6 flex items-center justify-center bg-gaming-primary rounded-full text-sm font-bold text-white">
            {game.stake_amount}
          </span>
          <span className="block text-center text-4xl text-gaming-text-primary group-hover:text-white transition-colors">
            {label}
          </span>
          <span className="block text-sm text-center text-gaming-text-secondary mt-2">
            {!authenticated 
              ? "Sign in to Play" 
              : game.player1_did === userId 
                ? "Your Game" 
                : game.player2_did 
                  ? "Game in Progress"
                  : "Play"}
          </span>
        </button>
      ))}
    </div>
  );
};