import { ClaimButton } from "../ClaimButton";

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
      <p className="text-gaming-success text-xl font-bold animate-pulse">
        You won!
      </p>
      {canClaim && !hasUserClaimed && (
        <ClaimButton onClaim={handleClaim} stakeAmount={stakeAmount} />
      )}
      {hasUserClaimed && (
        <p className="text-gaming-text-secondary">
          Reward already claimed
        </p>
      )}
    </div>
  );
};