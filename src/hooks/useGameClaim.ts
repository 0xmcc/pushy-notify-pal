import { useState, useEffect } from "react";
import { incrementOffChainBalance } from "@/utils/supabaseRPC";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      
      // First, verify the claim hasn't been made yet with a fresh DB check
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('player1_claimed_at, player2_claimed_at, winner_did')
        .eq('id', gameId)
        .single();
        
      if (matchError) throw matchError;
      
      // Double check if user has already claimed
      const hasAlreadyClaimed = isUserPlayer1 
        ? Boolean(matchData.player1_claimed_at) 
        : Boolean(matchData.player2_claimed_at);
        
      if (hasAlreadyClaimed) {
        toast.error('Reward already claimed');
        return;
      }
      
      // Verify user is actually the winner
      if (matchData.winner_did !== winner_did) {
        toast.error('Invalid claim attempt');
        return;
      }

      // Update the claimed_at timestamp atomically
      const claimField = isUserPlayer1 ? 'player1_claimed_at' : 'player2_claimed_at';
      const { error: updateError } = await supabase
        .from('matches')
        .update({ [claimField]: new Date().toISOString() })
        .eq('id', gameId)
        // Add conditions to prevent race conditions
        .is(claimField, null)
        .eq('winner_did', winner_did);
        
      if (updateError) {
        console.error('Error updating claim status:', updateError);
        toast.error('Failed to claim reward');
        return;
      }

      // Only proceed with reward if the claim was successful
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