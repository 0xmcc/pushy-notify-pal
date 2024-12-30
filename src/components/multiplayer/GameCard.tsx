import { DollarSign } from "lucide-react";
import { GameActions } from "./GameActions";
import { Game } from "@/types/game";
import { usePrivy } from "@privy-io/react-auth";
import { GameHeader } from "./GameHeader";
import { GameMoveDisplay } from "./GameMoveDisplay";

interface GameCardProps {
  game: Game;
  onPlayMove: (gameId: string, move: string) => Promise<void>;
}

export const GameCard = ({ game, onPlayMove }: GameCardProps) => {
  const { user, authenticated } = usePrivy();
  
  const isGameComplete = game.player1_move && game.player2_move;
  const isUserPlayer1 = user?.id === game.player1_did;
  const isUserPlayer2 = user?.id === game.player2_did;
  const isUserInGame = isUserPlayer1 || isUserPlayer2;
  const isUserWinner = user?.id === game.winner_did;
  const canClaim = isGameComplete && isUserWinner && game.status !== 'completed';

  const getMoveResult = () => {
    if (!isGameComplete) return null;
    if (isUserPlayer1) {
      return isUserWinner ? 'You Won!' : game.winner_did ? 'You Lost!' : 'Draw!';
    }
    if (isUserPlayer2) {
      return isUserWinner ? 'You Won!' : game.winner_did ? 'You Lost!' : 'Draw!';
    }
    return game.winner_did ? 'Game Completed' : 'Draw';
  };

  return (
    <div className="relative border border-gaming-accent rounded-lg p-6 bg-gaming-card/80 backdrop-blur-sm hover:bg-gaming-card/90 transition-all">
      <GameHeader 
        playerDid={game.player1_did}
        playerName={game.creator_name}
        playerRating={game.creator_rating}
        stakeAmount={game.stake_amount}
      />

      {isGameComplete ? (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <span className={`text-xl font-bold ${isUserWinner ? 'text-green-500' : game.winner_did ? 'text-red-500' : 'text-gaming-text-primary'}`}>
              {getMoveResult()}
            </span>
          </div>
          <div className="flex items-center justify-center gap-8">
            <GameMoveDisplay 
              move={game.player1_move} 
              isWinner={game.winner_did === game.player1_did}
            />
            <span className="text-2xl font-bold text-gaming-text-primary">VS</span>
            <GameMoveDisplay 
              move={game.player2_move} 
              isWinner={game.winner_did === game.player2_did}
            />
          </div>
          {canClaim && (
            <button
              onClick={() => onPlayMove(game.id, 'claim')}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <DollarSign className="w-5 h-5" />
              <span>Claim {game.stake_amount * 2} SOL</span>
            </button>
          )}
        </div>
      ) : (
        <GameActions 
          game={game}
          onPlayMove={onPlayMove}
          authenticated={authenticated}
          userId={user?.id}
        />
      )}
    </div>
  );
};