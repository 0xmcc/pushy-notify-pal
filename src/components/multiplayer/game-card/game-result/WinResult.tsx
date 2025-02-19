import { GameResultButton } from "./GameResultButton";

interface WinResultProps {
  canClaim: boolean;
  hasUserClaimed: boolean;
  handleClaim: () => Promise<void>;
  stakeAmount: number;
}

export const WinResult = ({ 
  canClaim, 
  hasUserClaimed, 
  handleClaim, 
  stakeAmount 
}: WinResultProps) => {
  return (
    <div className="text-center space-y-3">
      <div className="relative h-8">
        <p className="absolute left-1/2 -translate-x-1/2 text-gaming-success text-xl font-bold animate-pulse">
          You won!
        </p>
      </div>
      {canClaim && !hasUserClaimed && (
        <GameResultButton 
          onClick={handleClaim} 
          variant="claim" 
          stakeAmount={stakeAmount} 
        />
      )}
      {hasUserClaimed && (
        <p className="text-gaming-text-secondary">
          Reward already claimed
        </p>
      )}
    </div>
  );
};