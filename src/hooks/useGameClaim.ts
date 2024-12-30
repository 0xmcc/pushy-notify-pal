import { useState, useEffect } from "react";
import { incrementOffChainBalance } from "@/utils/supabaseRPC";
import { toast } from "sonner";

interface UseGameClaimProps {
  isUserPlayer1: boolean;
  player1_claimed_at?: string | null;
  player2_claimed_at?: string | null;
  winner_did: string | null;
  stakeAmount: number;
  gameId: string;
  onClaim: (gameId: string, move: string) => Promise<void>;
}

export const useGameClaim = ({
  isUserPlayer1,
  player1_claimed_at,
  player2_claimed_at,
  winner_did,
  stakeAmount,
  gameId,
  onClaim,
}: UseGameClaimProps) => {
  const [localClaimStatus, setLocalClaimStatus] = useState(false);

  const hasUserClaimed = isUserPlayer1 
    ? Boolean(player1_claimed_at) 
    : Boolean(player2_claimed_at);

  useEffect(() => {
    if (hasUserClaimed) {
      setLocalClaimStatus(true);
    }
  }, [hasUserClaimed, player1_claimed_at, player2_claimed_at]);

  const handleClaim = async () => {
    if (localClaimStatus || hasUserClaimed) {
      toast.error('Reward already claimed');
      return;
    }

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
        setLocalClaimStatus(true);
        toast.success(`${stakeAmount * 2} SOL added to your off-chain balance`);
      }
    } catch (error) {
      console.error('Error in handleClaim:', error);
      toast.error('Failed to claim reward');
    }
  };

  return {
    localClaimStatus,
    hasUserClaimed,
    handleClaim,
  };
};