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
    <div className="relative border border-gaming-accent/20 rounded-xl p-6 
                    bg-gradient-to-br from-[#1a1a1d] via-[#2a2a3a] to-[#1a1a1d]
                    hover:border-gaming-accent/40 transition-all duration-300 
                    shadow-[0_0_25px_rgba(139,92,246,0.1)] 
                    hover:shadow-[0_0_35px_rgba(139,92,246,0.2)]
                    backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/10 to-[#D946EF]/10 rounded-xl opacity-50" />
      <div className="relative z-10">
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
    </div>
  );
};