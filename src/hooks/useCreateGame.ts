import { useState } from "react";
import { createGame } from "@/utils/gameCreation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      // Get the inventory column name based on the selected move
      const inventoryColumn = selectedMove === '0' ? 'rock_count' 
                          : selectedMove === '1' ? 'paper_count'
                          : 'scissors_count';

      // First, check if the user has enough of the selected move
      const { data: userData, error: checkError } = await supabase
        .from('users')
        .select(inventoryColumn)
        .eq('did', userId)
        .single();

      if (checkError) throw checkError;
      
      if (!userData || userData[inventoryColumn] <= 0) {
        throw new Error(`You don't have any more of this move available!`);
      }

      // Update the inventory count
      const { error: updateError } = await supabase
        .from('users')
        .update({ [inventoryColumn]: userData[inventoryColumn] - 1 })
        .eq('did', userId);

      if (updateError) throw updateError;

      // Create the game
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