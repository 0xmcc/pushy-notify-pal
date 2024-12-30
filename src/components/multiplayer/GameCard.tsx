import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FileIcon, DollarSign } from "lucide-react";
import { GameActions } from "./GameActions";
import { Game } from "@/types/game";
import { usePrivy } from "@privy-io/react-auth";

interface GameCardProps {
  game: Game;
  onPlayMove: (gameId: string, move: string) => Promise<void>;
}

export const GameCard = ({ game, onPlayMove }: GameCardProps) => {
  const { user, authenticated } = usePrivy();
  const fallbackAvatar = "/placeholder.svg";
  
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

  const renderMoveIcon = (move: string | null, isPlayer1 = true) => {
    if (!move) return null;
    const isWinner = (isPlayer1 && game.winner_did === game.player1_did) || 
                    (!isPlayer1 && game.winner_did === game.player2_did);
    return (
      <div className={`relative p-4 rounded-full ${isWinner ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
        <FileIcon className={`w-8 h-8 ${isWinner ? 'text-green-500' : 'text-red-500'}`} />
        <span className="block text-center mt-2 text-sm text-gaming-text-secondary">{move}</span>
      </div>
    );
  };

  return (
    <div className="relative border border-gaming-accent rounded-lg p-6 bg-gaming-card/80 backdrop-blur-sm hover:bg-gaming-card/90 transition-all">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-12 w-12 border-2 border-gaming-accent">
          <AvatarImage 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${game.player1_did}`}
            onError={(e) => {
              console.log("Avatar image failed to load, using fallback");
              (e.target as HTMLImageElement).src = fallbackAvatar;
            }}
          />
          <AvatarFallback>
            {game.creator_name?.slice(0, 2).toUpperCase() || 'XX'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-bold text-gaming-text-primary">
            {game.creator_name || game.player1_did}
          </h3>
          <p className="text-gaming-text-secondary flex items-center gap-2">
            <span>{game.creator_rating || 1200} ELO</span>
            <span className="text-gaming-accent">•</span>
            <span>{game.stake_amount} SOL</span>
          </p>
        </div>
      </div>

      {isGameComplete ? (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <span className={`text-xl font-bold ${isUserWinner ? 'text-green-500' : game.winner_did ? 'text-red-500' : 'text-gaming-text-primary'}`}>
              {getMoveResult()}
            </span>
          </div>
          <div className="flex items-center justify-center gap-8">
            {renderMoveIcon(game.player1_move, true)}
            <span className="text-2xl font-bold text-gaming-text-primary">VS</span>
            {renderMoveIcon(game.player2_move, false)}
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