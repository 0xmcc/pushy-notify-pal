'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePrivy } from "@privy-io/react-auth";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import BN from 'bn.js';
import { supabase } from "@/integrations/supabase/client";
import { getProgram } from "@/services/game-service";
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
    if (!authenticated) {
      toast.error("Please sign in to create a game");
      return;
    }

    if (!user?.wallet?.address) {
      toast.error("Please connect your wallet to create a game");
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
      const program = await getProgram(user.wallet);
      if (!program) {
        throw new Error("Failed to initialize program");
      }

      const dummyPlayerTwo = anchor.web3.Keypair.generate();
      const betAmount = new BN(Number(stakeAmount) * LAMPORTS_PER_SOL);

      const [gamePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("game"),
          new anchor.web3.PublicKey(user.wallet.address).toBuffer(),
          dummyPlayerTwo.publicKey.toBuffer()
        ],
        program.programId
      );

      const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), gamePda.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .createGame(betAmount)
        .accounts({
          playerOne: new anchor.web3.PublicKey(user.wallet.address),
          playerTwo: dummyPlayerTwo.publicKey,
          gameAccount: gamePda,
          vault: vaultPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc({ commitment: "confirmed" });

      const { error } = await supabase
        .from('active_games')
        .insert({
          creator_did: user.id,
          stake_amount: Number(stakeAmount),
          selected_move: String(moveToNumber(selectedMove)),
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