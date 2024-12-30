import { useState } from "react";
import { createGame } from "@/utils/gameCreation";
import { toast } from "sonner";

export const useCreateGame = () => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedMove, setSelectedMove] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async (userId: string) => {
    if (!userId) {
      toast.error("Please sign in to create a game");
      return;
    }

    if (!stakeAmount || isNaN(Number(stakeAmount))) {
      toast.error("Please enter a valid stake amount");
      return;
    }

    if (!selectedMove) {
      toast.error("Please select your move");
      return;
    }

    setIsCreating(true);
    try {
      await createGame({
        userId,
        selectedMove,
        stakeAmount,
      });
      
      toast.success("Game created successfully!");
      setStakeAmount("");
      setSelectedMove('');
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error(error instanceof Error ? error.message : "Failed to create game");
    } finally {
      setIsCreating(false);
    }
  };

  return {
    stakeAmount,
    setStakeAmount,
    selectedMove,
    setSelectedMove,
    isCreating,
    handleCreateGame,
  };
};