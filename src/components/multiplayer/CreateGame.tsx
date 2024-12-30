'use client';

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { StakeInput } from "./StakeInput";
import { GameMoveSelector } from "./GameMoveSelector";
import { useCreateGame } from "@/hooks/useCreateGame";

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

  const onCreateGame = () => {
    if (user?.id) {
      handleCreateGame(user.id);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gaming-text-primary">Create New Game</h2>
      
      <div className="space-y-4">
        <StakeInput value={stakeAmount} onChange={setStakeAmount} />
        <GameMoveSelector selectedMove={selectedMove} onMoveSelect={setSelectedMove} />
      </div>
      
      <Button 
        onClick={onCreateGame}
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