'use client';

import { GameMoveComparison } from "../game-card/GameMoveComparison";
import { DrawResult } from "../game-card/game-result/DrawResult";
import { WinResult } from "../game-card/game-result/WinResult";
import { LoseResult } from "../game-card/game-result/LoseResult";
import { useGameClaim } from "@/hooks/useGameClaim";
import { hideGame } from "@/utils/gameUtils";
import { usePrivy } from "@privy-io/react-auth";

interface GameResultProps {
  player1Move: string | null;
  player2Move: string | null;
  isUserPlayer1: boolean;
  isUserPlayer2: boolean;
  isUserWinner: boolean;
  winner_did: string | null;
  player1_did: string;
  player2_did: string | null;
  stakeAmount: number;
  canClaim: boolean;
  onClaim: (gameId: string, move: string) => Promise<void>;
  gameId: string;
  player1_claimed_at?: string | null;
  player2_claimed_at?: string | null;
}

export const GameResult = ({
  player1Move,
  player2Move,
  isUserPlayer1,
  isUserPlayer2,
  isUserWinner,
  winner_did,
  player1_did,
  player2_did,
  stakeAmount,
  canClaim,
  onClaim,
  gameId,
  player1_claimed_at,
  player2_claimed_at,
}: GameResultProps) => {
  const { user } = usePrivy();

  const isDraw = player1Move && player2Move && !winner_did;
  const isUserInGame = isUserPlayer1 || isUserPlayer2;
  const hasLost = isUserInGame && !isUserWinner && !isDraw;

  const { localClaimStatus, hasUserClaimed, handleClaim } = useGameClaim({
    isUserPlayer1,
    player1_claimed_at,
    player2_claimed_at,
    winner_did,
    stakeAmount,
    gameId,
    onClaim,

  });
  const handleHideGame = async () => {
    if (!user?.id) return;
    await hideGame(gameId, user.id);
  };

  return (
    <div className="space-y-4">
      <GameMoveComparison
        player1Move={player1Move}
        player2Move={player2Move}
        isDraw={isDraw}
        winner_did={winner_did}
        player1_did={player1_did}
        player2_did={player2_did}
      />
      
      {isDraw && <DrawResult handleHideGame={handleHideGame} />}
      
      {isUserWinner && !isDraw && (
        <WinResult
          canClaim={canClaim}
          hasUserClaimed={localClaimStatus || hasUserClaimed}
          handleClaim={handleClaim}
          stakeAmount={stakeAmount}
        />
      )}

      {hasLost && <LoseResult handleHideGame={handleHideGame} />}
    </div>
  );
};