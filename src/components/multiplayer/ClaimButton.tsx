import { Coins } from "lucide-react";

interface ClaimButtonProps {
  onClaim: () => void;
  stakeAmount: number;
}

export const ClaimButton = ({ onClaim, stakeAmount }: ClaimButtonProps) => {
  return (
    <button
      onClick={onClaim}
      className="w-full py-3 px-4 bg-gaming-success/10 hover:bg-gaming-success/20 
                text-gaming-success border border-gaming-success/20 rounded-lg 
                flex items-center justify-center gap-2 transition-all duration-300
                hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
    >
      <Coins className="w-5 h-5" />
      <span className="font-medium">Claim {stakeAmount * 2} SOL</span>
    </button>
  );
};