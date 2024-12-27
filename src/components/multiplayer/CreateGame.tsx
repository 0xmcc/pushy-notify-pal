'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { usePrivy } from "@privy-io/react-auth";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import BN from 'bn.js';
import { IDL } from '@/types/rps_game';

const PROGRAM_ID = "8LCEgTSrryvRuX3AE46Pa1msev4CfPXZiiWzbg6Vk8bn";

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
  const { connection } = useConnection();
  const { publicKey, wallet, sendTransaction } = useWallet();
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedMove, setSelectedMove] = useState<Move | ''>('');
  const [isCreating, setIsCreating] = useState(false);

  const getProgram = () => {
    if (!publicKey || !wallet) return null;

    const provider = new anchor.AnchorProvider(
      connection,
      (wallet.adapter as anchor.Wallet),
      { commitment: 'processed' }
    );

    anchor.setProvider(provider);

    return new anchor.Program(
      IDL,
      new PublicKey(PROGRAM_ID),
      provider
    );
  };

  const handleCreateGame = async () => {
    if (!authenticated) {
      toast.error("Please sign in to create a game");
      return;
    }

    if (!publicKey || !wallet) {
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
      const program = getProgram();
      if (!program) {
        throw new Error("Failed to initialize program");
      }

      // Convert stake amount to lamports
      const betAmount = new BN(Number(stakeAmount) * LAMPORTS_PER_SOL);

      // For testing, we'll use a dummy player two
      // In production, this should be the opponent's public key
      const dummyPlayerTwo = anchor.web3.Keypair.generate();

      // Derive PDAs
      const [gamePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("game"),
          publicKey.toBuffer(),
          dummyPlayerTwo.publicKey.toBuffer()
        ],
        program.programId
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), gamePda.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .createGame(betAmount)
        .accounts({
          playerOne: publicKey,
          playerTwo: dummyPlayerTwo.publicKey,
          gameAccount: gamePda,
          vault: vaultPda,
        })
        .rpc({ commitment: "confirmed" });

      // Store game in Supabase for UI
      const { error } = await supabase
        .from('active_games')
        .insert({
          creator_did: user?.id,
          stake_amount: Number(stakeAmount),
          selected_move: moveToNumber(selectedMove),
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
            step="0.01"
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
        disabled={isCreating || !authenticated || !publicKey}
        className="w-full bg-gradient-to-r from-gaming-primary to-gaming-secondary hover:opacity-90 text-white disabled:opacity-50"
      >
        {!authenticated ? "Sign in to Create Game" : 
         !publicKey ? "Connect Wallet to Create Game" :
         isCreating ? "Creating..." : "Create Game"}
      </Button>
    </div>
  );
};