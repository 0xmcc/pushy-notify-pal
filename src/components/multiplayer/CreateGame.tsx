'use client';

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { StakeInput } from "./StakeInput";
import { GameMoveSelector } from "./GameMoveSelector";
import { useCreateGame } from "@/hooks/useCreateGame";
import { usePlayerStats } from "@/hooks/usePlayerStats";

export const CreateGame = () => {
  const { user, authenticated } = usePrivy();
  const {
    stakeAmount,
    setStakeAmount,
    selectedMove,
    setSelectedMove,
    isCreating,
    handleCreateGame,
  } = useCreateGame();

  const { inventory } = usePlayerStats(user?.id);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gaming-text-primary">Create New Game</h2>
      
      <div className="space-y-4">
        <StakeInput value={stakeAmount} onChange={setStakeAmount} />
        <GameMoveSelector 
          selectedMove={selectedMove}
          onMoveSelect={setSelectedMove}
          inventory={{
            rock: inventory?.rock_count ?? 0,
            paper: inventory?.paper_count ?? 0,
            scissors: inventory?.scissors_count ?? 0,
          }}
          stakeAmount={Number(stakeAmount)}
        />
      </div>
      
      <Button 
        onClick={() => user?.id && handleCreateGame(user.id)}
        disabled={isCreating || !authenticated || !user?.wallet?.address}
        className="w-full bg-gradient-to-r from-gaming-primary to-gaming-secondary hover:opacity-90 text-white disabled:opacity-50"
      >
        {!authenticated ? "Sign in to Create Game" : 
         !user?.wallet?.address ? "Connect Wallet to Create Game" :
         isCreating ? "Creating..." : "Create Game"}
      </Button>
    </div>
  );
};