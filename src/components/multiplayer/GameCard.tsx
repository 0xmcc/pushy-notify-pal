'use client';

import { Game } from "@/types/game";
import { usePrivy } from "@privy-io/react-auth";
import { GameHeader } from "./GameHeader";
import { GameActions } from "./GameActions";
import { GameResult } from "./GameResult";

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
    const m1 = parseInt(move1);
    const m2 = parseInt(move2);
    
    if (m1 === m2) return null;
    
    if (
      (m1 === 0 && m2 === 2) || // Rock beats Scissors
      (m1 === 2 && m2 === 1) || // Scissors beats Paper
      (m1 === 1 && m2 === 0)    // Paper beats Rock
    ) {
      return game.player1_did;
    }
    return game.player2_did;
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
        <GameResult 
          player1Move={game.player1_move}
          player2Move={game.player2_move}
          isUserPlayer1={isUserPlayer1}
          isUserPlayer2={isUserPlayer2}
          isUserWinner={isUserWinner}
          winner_did={game.winner_did}
          player1_did={game.player1_did}
          player2_did={game.player2_did}
          stakeAmount={game.stake_amount}
          canClaim={canClaim}
          onClaim={onPlayMove}
          gameId={game.id}
        />
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