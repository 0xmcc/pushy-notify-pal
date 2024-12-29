'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePrivy } from "@privy-io/react-auth";
import { supabase } from "@/integrations/supabase/client";
import { StakeInput } from "./StakeInput";
import { GameMoveSelector } from "./GameMoveSelector";

type Move = 'rock' | 'paper' | 'scissors';

const moveToNumber = (move: Move): number => {
  switch (move) {
    case 'rock': return 0;
    case 'paper': return 1;
    case 'scissors': return 2;
    default: return 0;
  }
};

export const CreateGame = () => {
  const { user, authenticated } = usePrivy();
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedMove, setSelectedMove] = useState<Move | ''>('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async () => {
    console.log('Starting game creation process...');
    
    if (!authenticated) {
      console.log('User not authenticated');
      toast.error("Please sign in to create a game");
      return;
    }

    if (!user?.wallet?.address) {
      console.log('No wallet address found');
      toast.error("Please connect your wallet to create a game");
      return;
    }

    if (!stakeAmount || isNaN(Number(stakeAmount))) {
      console.log('Invalid stake amount:', stakeAmount);
      toast.error("Please enter a valid stake amount");
      return;
    }

    if (!selectedMove) {
      console.log('No move selected');
      toast.error("Please select your move");
      return;
    }

    setIsCreating(true);
    try {
      console.log('Creating match in Supabase...');
      const { error } = await supabase
        .from('matches')
        .insert({
          player1_did: user.id,
          player1_move: String(moveToNumber(selectedMove)),
          player1_move_timestamp: new Date().toISOString(),
          stake_amount: Number(stakeAmount),
          status: 'pending'
        });

      if (error) throw error;
      
      console.log('Match creation completed successfully');
      toast.success("Game created successfully!");
      setStakeAmount("");
      setSelectedMove('');
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error("Failed to create game");
    } finally {
      setIsCreating(false);
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
        onClick={handleCreateGame}
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