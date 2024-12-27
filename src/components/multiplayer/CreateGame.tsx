'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CreateGame = () => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async () => {
    if (!stakeAmount || isNaN(Number(stakeAmount))) {
      toast.error("Please enter a valid stake amount");
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('active_games')
        .insert({
          player1_did: 'test-user-1', // Temporary hardcoded user ID
          stake_amount: Number(stakeAmount),
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Game created successfully!");
      setStakeAmount("");
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error("Failed to create game");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="stakeAmount" className="block text-sm font-medium text-gray-700 mb-1">
          Stake Amount
        </label>
        <Input
          id="stakeAmount"
          type="number"
          min="0"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          placeholder="Enter stake amount"
          className="w-full"
        />
      </div>
      
      <Button 
        onClick={handleCreateGame}
        disabled={isCreating}
        className="w-full"
      >
        {isCreating ? "Creating..." : "Create Game"}
      </Button>
    </div>
  );
};