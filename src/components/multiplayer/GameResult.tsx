'use client';

import { incrementOffChainBalance } from "@/utils/supabaseRPC";
import { toast } from "sonner";
import { GameMoveComparison } from "./GameMoveComparison";
import { DrawResult } from "./game-result/DrawResult";
import { WinResult } from "./game-result/WinResult";
import { LoseResult } from "./game-result/LoseResult";

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
  const isDraw = player1Move && player2Move && !winner_did;
  const isUserInGame = isUserPlayer1 || isUserPlayer2;
  const hasLost = isUserInGame && !isUserWinner && !isDraw;
  const hasUserClaimed = isUserPlayer1 ? !!player1_claimed_at : !!player2_claimed_at;

  const handleClaim = async () => {
    try {
      console.log('Claiming reward for game:', gameId);
      await onClaim(gameId, 'claim');

      if (winner_did) {
        console.log('Updating balance for winner:', winner_did);
        const result = await incrementOffChainBalance(winner_did, stakeAmount * 2);
        if (result === null) {
          toast.error('Failed to update balance');
          return;
        }
        toast.success(`${stakeAmount * 2} SOL added to your off-chain balance`);
      }
    } catch (error) {
      console.error('Error in handleClaim:', error);
      toast.error('Failed to claim reward');
    }
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
      
      {isDraw && <DrawResult isUserInGame={isUserInGame} />}
      
      {isUserWinner && !isDraw && (
        <WinResult
          canClaim={canClaim}
          hasUserClaimed={hasUserClaimed}
          handleClaim={handleClaim}
          stakeAmount={stakeAmount}
        />
      )}

      {hasLost && <LoseResult />}
    </div>
  );
};