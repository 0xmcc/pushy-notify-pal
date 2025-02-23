import { useState } from "react";
import { toast } from "sonner";
import { validateAndDeductStake, validateAndDeductMove, createMatch } from "../utils/gameCreation";
import { sendGameNotification } from "../utils/notifications";
import { useRPS } from "@/providers/RPSProvider";

export const useCreateGame = () => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedMove, setSelectedMove] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const { createGameAndCommitMove, isLoading: isProgramLoading } = useRPS();

  const handleCreateGame = async (userId: string) => {
    if (!validateInputs(userId, stakeAmount, selectedMove)) return;

    setIsCreating(true);
    try {
      // 1. Handle off-chain game creation first
      const stakeValue = await validateAndDeductStake({ userId, stakeAmount });
      const validatedMove = await validateAndDeductMove({ userId, selectedMove });
      const match = await createMatch(userId, validatedMove, stakeValue);
      await sendGameNotification(userId);

      // 2. Handle on-chain game creation if available
      if (createGameAndCommitMove && !isProgramLoading) {
        try {
          const result = await createGameAndCommitMove(
            Number(stakeAmount),
            Number(selectedMove)
          );

          if (result) {
            // Store Solana game info in match metadata or separate table if needed
            console.log('Solana game created:', result.gameAccount.toString());
            console.log('Move committed:', result.commitment);
          }
        } catch (error) {
          console.error('Failed to create Solana game:', error);
          // Don't throw here - we still created the off-chain game successfully
          toast.error('Failed to create on-chain game, but off-chain game was created');
        }
      }

      handleSuccess();
    } catch (error) {
      handleError(error);
    } finally {
      setIsCreating(false);
    }
  };

  const validateInputs = (userId: string, stakeAmount: string, selectedMove: string): boolean => {
    if (!userId) {
      toast.error("Please sign in to create a game");
      return false;
    }
    if (!stakeAmount || isNaN(Number(stakeAmount))) {
      toast.error("Please enter a valid stake amount");
      return false;
    }
    if (!selectedMove) {
      toast.error("Please select your move");
      return false;
    }
    return true;
  };

  const handleSuccess = () => {
    toast.success("Game created successfully!");
    setStakeAmount("");
    setSelectedMove('');
  };

  const handleError = (error: unknown) => {
    console.error('Error creating game:', error);
    toast.error(error instanceof Error ? error.message : "Failed to create game");
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