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
    <div className="flex flex-col items-center space-y-3">
      <p className="text-gaming-success text-xl font-bold animate-pulse text-center w-full">
        You won!
      </p>
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