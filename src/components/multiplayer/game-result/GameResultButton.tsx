import { Coins, EyeOff } from "lucide-react";

interface GameResultButtonProps {
  onClick: () => void;
  variant: 'claim' | 'hide';
  stakeAmount?: number;
}

export const GameResultButton = ({ onClick, variant, stakeAmount }: GameResultButtonProps) => {
  const isClaimVariant = variant === 'claim';
  
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 px-4 rounded-lg 
                flex items-center justify-center gap-2 transition-all duration-300
                ${isClaimVariant 
                  ? "bg-gaming-success/10 hover:bg-gaming-success/20 text-gaming-success border border-gaming-success/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "bg-gaming-accent/10 hover:bg-gaming-accent/20 text-gaming-accent border border-gaming-accent/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                }`}
    >
      {isClaimVariant ? (
        <>
          <Coins className="w-5 h-5" />
          <span className="font-medium">Claim {stakeAmount! * 2} SOL</span>
        </>
      ) : (
        <>
          <EyeOff className="w-5 h-5" />
          <span className="font-medium">Hide Game</span>
        </>
      )}
    </button>
  );
}; 