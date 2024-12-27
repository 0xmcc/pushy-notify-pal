import { Game } from "@/types/game";

interface GameActionsProps {
  game: Game;
  onPlayMove: (gameId: string, move: string) => Promise<void>;
  authenticated: boolean;
  userId?: string;
}

export const GameActions = ({ game, onPlayMove, authenticated, userId }: GameActionsProps) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {['rock', 'paper', 'scissors'].map((move) => (
        <button
          key={move}
          onClick={() => onPlayMove(game.id, move)}
          disabled={!authenticated || game.creator_did === userId}
          className="relative group px-4 py-3 rounded-lg bg-gaming-accent/20 hover:bg-gaming-accent/30 transition-colors border border-gaming-accent/50 hover:border-gaming-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute -top-3 -right-3 w-6 h-6 flex items-center justify-center bg-gaming-primary rounded-full text-sm font-bold text-white">
            {game.stake_amount}
          </span>
          <span className="block text-center text-gaming-text-primary group-hover:text-white transition-colors">
            {!authenticated ? "Sign in to Play" : game.creator_did === userId ? "Your Game" : `Play ${move}`}
          </span>
        </button>
      ))}
    </div>
  );
};