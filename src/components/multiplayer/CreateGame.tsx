'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePrivy } from "@privy-io/react-auth";

type Move = 'rock' | 'paper' | 'scissors';

export const CreateGame = () => {
  const { user, authenticated } = usePrivy();
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedMove, setSelectedMove] = useState<Move | ''>('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async () => {
    if (!authenticated) {
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
      const { error } = await supabase
        .from('active_games')
        .insert({
          creator_did: user?.id,
          stake_amount: Number(stakeAmount),
          selected_move: selectedMove,
          status: 'active'
        });

      if (error) throw error;
      
      toast.success("Game created successfully!");
      setStakeAmount("");
      setSelectedMove('');
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error("Failed to create game");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gaming-text-primary">Create New Game</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="stakeAmount" className="block text-sm font-medium text-gaming-text-secondary mb-1">
            Stake Amount (SOL)
          </Label>
          <Input
            id="stakeAmount"
            type="number"
            min="0"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="Enter stake amount"
            className="w-full bg-gaming-card border-gaming-accent text-gaming-text-primary placeholder:text-gaming-text-secondary"
          />
        </div>

        <div className="space-y-2">
          <Label className="block text-sm font-medium text-gaming-text-secondary">
            Select Your Move
          </Label>
          <RadioGroup
            value={selectedMove}
            onValueChange={(value) => setSelectedMove(value as Move)}
            className="flex gap-4"
          >
            {['rock', 'paper', 'scissors'].map((move) => (
              <div key={move} className="flex items-center space-x-2">
                <RadioGroupItem value={move} id={move} className="border-gaming-accent text-gaming-primary" />
                <Label htmlFor={move} className="capitalize text-gaming-text-primary">{move}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
      
      <Button 
        onClick={handleCreateGame}
        disabled={isCreating || !authenticated}
        className="w-full bg-gradient-to-r from-gaming-primary to-gaming-secondary hover:opacity-90 text-white disabled:opacity-50"
      >
        {!authenticated ? "Sign in to Create Game" : isCreating ? "Creating..." : "Create Game"}
      </Button>
    </div>
  );
};