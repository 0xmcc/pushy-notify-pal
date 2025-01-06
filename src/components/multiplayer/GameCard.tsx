'use client';

import { Game } from "@/types/game";
import { usePrivy } from "@privy-io/react-auth";
import { GameHeader } from "./GameHeader";
import { GameActions } from "./GameActions";
import { GameResult } from "./GameResult";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { Lock } from "lucide-react";

interface GameCardProps {
  game: Game;
  onPlayMove: (gameId: string, move: string) => Promise<void>;
}

export const GameCard = ({ game, onPlayMove }: GameCardProps) => {
  const { user, authenticated } = usePrivy();
  const playerStats = usePlayerStats();
  
  const isGameComplete = game.player1_move && game.player2_move;
  const isUserPlayer1 = user?.id === game.player1_did;
  const isUserPlayer2 = user?.id === game.player2_did;
  const isUserInGame = isUserPlayer1 || isUserPlayer2;
  const isUserWinner = user?.id === game.winner_did;
  const canClaim = isGameComplete && isUserWinner;

  return (
    <div className="relative border border-gaming-accent/20 rounded-xl p-6 bg-[#0A0A0B]/90 backdrop-blur-sm 
                    hover:border-gaming-accent/40 transition-all duration-300 
                    shadow-[0_0_15px_rgba(42,42,46,0.2)] hover:shadow-[0_0_25px_rgba(42,42,46,0.3)]">
      <GameHeader 
        playerDid={game.player1_did}
        playerName={game.creator_name}
        playerRating={game.creator_rating}
        stakeAmount={game.stake_amount}
      />

      {!isGameComplete && game.status === 'pending' && (
        <div className="flex justify-center items-center py-4">
          <Lock className="w-6 h-6 text-gaming-text-secondary animate-pulse" />
        </div>
      )}

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
          player1_claimed_at={game.player1_claimed_at}
          player2_claimed_at={game.player2_claimed_at}
        />
      ) : (
        <GameActions 
          game={game}
          onPlayMove={onPlayMove}
          authenticated={authenticated}
          userId={user?.id}
          playerInventory={{
            rock_count: playerStats.rock_count,
            paper_count: playerStats.paper_count,
            scissors_count: playerStats.scissors_count
          }}
        />
      )}
    </div>
  );
};