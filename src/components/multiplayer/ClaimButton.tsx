'use client';

import { Coins, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface ClaimButtonProps {
  onClaim: () => void;
  stakeAmount: number;
}

export const ClaimButton = ({ onClaim, stakeAmount }: ClaimButtonProps) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [showFloatingAmount, setShowFloatingAmount] = useState(false);

  const handleClaim = async () => {
    if (isClaiming || isClaimed) return;
    
    setIsClaiming(true);
    try {
      await onClaim();
      setShowFloatingAmount(true);
      setTimeout(() => {
        setIsClaimed(true);
      }, 500);
    } catch (error) {
      setIsClaiming(false);
    }
  };

  if (isClaimed) {
    return (
      <div className="w-full py-3 px-4 bg-gaming-success/20 text-gaming-success 
                    border border-gaming-success/30 rounded-lg flex items-center 
                    justify-center gap-2 animate-fade-in">
        <CheckCircle2 className="w-5 h-5" />
        <span className="font-medium">Claimed!</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {showFloatingAmount && (
        <div className="absolute w-full text-center -top-8 text-gaming-success font-bold animate-float-up">
          +{stakeAmount * 2} SOL
        </div>
      )}
      <button
        onClick={handleClaim}
        disabled={isClaiming}
        className={`w-full py-3 px-4 bg-gaming-success/10 
                  text-gaming-success border border-gaming-success/20 rounded-lg 
                  flex items-center justify-center gap-2 transition-all duration-300
                  hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]
                  hover:bg-gaming-success/20 
                  ${isClaiming ? 'opacity-75 cursor-not-allowed' : ''}
                  group animate-scale-in
                  hover:scale-105 active:scale-95`}
      >
        <Coins className={`w-5 h-5 transition-transform group-hover:scale-110 
                        ${isClaiming ? 'animate-bounce' : ''}`} />
        <span className="font-medium">
          {isClaiming ? 'Claiming...' : `Claim ${stakeAmount * 2} SOL`}
        </span>
      </button>
    </div>
  );
};