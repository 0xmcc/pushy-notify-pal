import { Game } from "@/types/game";
import { Button } from "@/components/ui/button";
import { GameMoveSelector } from "../GameMoveSelector";
import { useState } from "react";
import { Share2 } from "lucide-react";

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

  if (isCreator) {
    return (
      <div className="mt-4 text-center text-gaming-text-secondary">
        Waiting for opponent...
        <div className="mt-4 text-center">
        <Button
          onClick={async () => {
            try {
              await navigator.share({
                title: `Hey! Want to play Rock Paper Scissors? I've already selected my move 😅 ${window.location.href}invite`,
              });
            } catch (error) {
              console.log('Error sharing:', error);
              // Fallback to regular invite if sharing fails
              userId && onPlayMove(game.id, 'invite');
            }
          }}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2 px-4 rounded-full transition-colors duration-300"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Invite a Friend to Play
        </Button>
      </div>
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

  // if (!authenticated) {
  //   return (
  //     <div className="mt-4 text-center text-gaming-text-secondary">
  //       Sign in to play
  //     </div>
  //   );
  // }