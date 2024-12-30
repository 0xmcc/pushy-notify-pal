'use client';

import { Game } from "@/types/game";
import { usePrivy } from "@privy-io/react-auth";
import { GameHeader } from "./GameHeader";
import { GameActions } from "./GameActions";
import { GameResult } from "./GameResult";
import { GameCardWrapper } from "./GameCardWrapper";
import { Gamepad2, Swords } from "lucide-react";

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

  return (
    <GameCardWrapper>
      {/* Game Status Icon */}
      <div className="absolute top-4 right-4">
        {isGameComplete ? (
          <Swords className="w-6 h-6 text-gaming-primary animate-pulse" />
        ) : (
          <Gamepad2 className="w-6 h-6 text-gaming-secondary animate-pulse" />
        )}
      </div>

      {/* Stake Amount Badge */}
      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gaming-accent/20 border border-gaming-accent/30">
        <span className="text-sm font-bold bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent">
          {game.stake_amount} SOL
        </span>
      </div>

      <div className="mt-8">
        <GameHeader 
          playerDid={game.player1_did}
          playerName={game.creator_name}
          playerRating={game.creator_rating}
          stakeAmount={game.stake_amount}
        />

        <div className="relative z-10">
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
      </div>
    </GameCardWrapper>
  );
};