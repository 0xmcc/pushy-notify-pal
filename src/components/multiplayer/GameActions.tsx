import { Game } from "@/types/game";
import { Button } from "@/components/ui/button";
import { GameMoveSelector } from "./GameMoveSelector";
import { useState } from "react";

interface GameActionsProps {
  game: Game;
  onPlayMove: (gameId: string, move: string) => Promise<void>;
  authenticated: boolean;
  userId?: string;
  playerInventory: {
    rock_count: number;
    paper_count: number;
    scissors_count: number;
  };
}

export const GameActions = ({ 
  game, 
  onPlayMove, 
  authenticated, 
  userId,
  playerInventory 
}: GameActionsProps) => {
  const [selectedMove, setSelectedMove] = useState('');
  const isCreator = userId === game.player1_did;
  const canJoinGame = !isCreator && game.status === 'pending';

  // if (!authenticated) {
  //   return (
  //     <div className="mt-4 text-center text-gaming-text-secondary">
  //       Sign in to play
  //     </div>
  //   );
  // }

  if (isCreator) {
    return (
      <div className="mt-4 text-center text-gaming-text-secondary">
        Waiting for opponent...
      </div>
    );
  }

  if (canJoinGame) {
    return (
      <div className="mt-4">
        <GameMoveSelector 
          selectedMove={selectedMove}
          onMoveSelect={(move) => {
            setSelectedMove(move);
            onPlayMove(game.id, move);
          }}
          inventory={playerInventory}
          stakeAmount={game.stake_amount}
        />
      </div>
    );
  }

  return (
    <div className="mt-4 text-center text-gaming-text-secondary">
      Game in progress...
    </div>
  );
};