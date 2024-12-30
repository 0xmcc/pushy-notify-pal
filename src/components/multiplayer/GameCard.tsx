'use client';

import { DollarSign } from "lucide-react";
import { GameActions } from "./GameActions";
import { Game } from "@/types/game";
import { usePrivy } from "@privy-io/react-auth";
import { GameHeader } from "./GameHeader";
import { GameMoveDisplay } from "./GameMoveDisplay";
import { cn } from "@/lib/utils";

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

  const determineWinner = (move1: string, move2: string) => {
    // Convert moves to numbers for easier comparison
    const m1 = parseInt(move1);
    const m2 = parseInt(move2);
    
    // If moves are the same, it's a draw
    if (m1 === m2) return null;
    
    // Rock (0) beats Scissors (2)
    // Scissors (2) beats Paper (1)
    // Paper (1) beats Rock (0)
    if (
      (m1 === 0 && m2 === 2) || // Rock beats Scissors
      (m1 === 2 && m2 === 1) || // Scissors beats Paper
      (m1 === 1 && m2 === 0)    // Paper beats Rock
    ) {
      return game.player1_did;
    }
    return game.player2_did;
  };

  const getMoveResult = () => {
    if (!isGameComplete) return null;
    
    // If there's already a winner determined by the backend, use that
    if (game.winner_did) {
      if (isUserPlayer1) {
        return game.winner_did === game.player1_did ? 'You Won!' : 'You Lost!';
      }
      if (isUserPlayer2) {
        return game.winner_did === game.player2_did ? 'You Won!' : 'You Lost!';
      }
      return 'Game Completed';
    }

    // Otherwise, determine the winner based on the moves
    const winner = determineWinner(game.player1_move!, game.player2_move!);
    if (!winner) return 'Draw!';
    
    if (isUserPlayer1) {
      return winner === game.player1_did ? 'You Won!' : 'You Lost!';
    }
    if (isUserPlayer2) {
      return winner === game.player2_did ? 'You Won!' : 'You Lost!';
    }
    return winner ? 'Game Completed' : 'Draw';
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
          <div className="flex items-center justify-center gap-8">
            <div className={cn(
              "p-1 rounded-full",
              isUserWinner && isUserPlayer1 || !isUserWinner && isUserPlayer2 ? "bg-green-500/10" : "bg-red-500/10"
            )}>
              <GameMoveDisplay 
                move={game.player1_move} 
                isWinner={game.winner_did === game.player1_did}
              />
            </div>
            <span className="text-2xl font-bold text-gaming-text-primary">VS</span>
            <div className={cn(
              "p-1 rounded-full",
              isUserWinner && isUserPlayer2 || !isUserWinner && isUserPlayer1 ? "bg-green-500/10" : "bg-red-500/10"
            )}>
              <GameMoveDisplay 
                move={game.player2_move} 
                isWinner={game.winner_did === game.player2_did}
              />
            </div>
          </div>
          
          <div className="space-y-2 text-center">
            <span className={cn(
              "text-sm font-semibold",
              isUserWinner ? "text-green-500" : game.winner_did ? "text-red-500" : "text-gaming-text-primary"
            )}>
              {getMoveResult()}
            </span>
            
            {canClaim && (
              <button
                onClick={() => onPlayMove(game.id, 'claim')}
                className="w-full py-2 px-4 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                <span>Claim {game.stake_amount * 2} SOL</span>
              </button>
            )}
          </div>
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