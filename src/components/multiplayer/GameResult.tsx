'use client';

import { incrementOffChainBalance } from "@/utils/supabaseRPC";
import { toast } from "sonner";
import { GameMoveComparison } from "./GameMoveComparison";
import { ClaimButton } from "./ClaimButton";
import { useState } from "react";

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
}: GameResultProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const isDraw = player1Move && player2Move && !winner_did;
  const isUserInGame = isUserPlayer1 || isUserPlayer2;
  const hasLost = isUserInGame && !isUserWinner && !isDraw;

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
        
        // Show sparkles animation
        setShowSparkles(true);
        
        // Show success animation and message
        toast.success(`${stakeAmount * 2} SOL added to your off-chain balance`, {
          duration: 3000,
        });
        
        // Trigger exit animation after a brief delay
        setTimeout(() => {
          setIsExiting(true);
        }, 800);
      }
    } catch (error) {
      console.error('Error in handleClaim:', error);
      toast.error('Failed to claim reward');
    }
  };

  return (
    <div className={`relative space-y-4 transition-all duration-500 
                    ${isExiting ? 'animate-claim-success' : 'opacity-100 scale-100'}`}>
      {showSparkles && (
        <>
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-gaming-success animate-sparkle delay-100" />
          <div className="absolute top-2 -right-2 w-4 h-4 bg-gaming-success animate-sparkle delay-300" />
          <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-gaming-success animate-sparkle delay-500" />
        </>
      )}
      
      <GameMoveComparison
        player1Move={player1Move}
        player2Move={player2Move}
        isDraw={isDraw}
        winner_did={winner_did}
        player1_did={player1_did}
        player2_did={player2_did}
      />
      
      {isDraw && (
        <div className="text-center animate-fade-in">
          <p className="text-gaming-accent text-xl font-bold animate-pulse">
            Draw!
          </p>
          {(isUserPlayer1 || isUserPlayer2) && (
            <p className="text-gaming-text-secondary mt-2">
              Stakes have been returned to your off-chain balance
            </p>
          )}
        </div>
      )}
      
      {isUserWinner && !isDraw && (
        <div className="text-center space-y-3 animate-fade-in">
          <p className="text-gaming-success text-xl font-bold animate-pulse">
            You won!
          </p>
          {canClaim && (
            <ClaimButton onClaim={handleClaim} stakeAmount={stakeAmount} />
          )}
        </div>
      )}

      {hasLost && (
        <div className="text-center animate-fade-in">
          <p className="text-gaming-danger text-xl font-bold animate-pulse">
            You lost!
          </p>
        </div>
      )}
    </div>
  );
};