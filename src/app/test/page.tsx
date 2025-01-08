'use client';

import { Buffer } from 'buffer';
import { Terminal, Loader2 } from "lucide-react";
import { useState } from "react";

import { useRPS } from "@/providers/RPSProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Move } from "@/types/game";

window.Buffer = Buffer;

export default function TestPage() {
  const { createGame, initializePlayer, deletePlayer, commitMove, client, connected } = useRPS();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [gamePda, setGamePda] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);

  const handlerWrapper = async (handler: () => Promise<any>, title: string, 
    successMsg: string, errorMsg: string) => {
    if (!connected) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const returnedValue = await handler();
      toast({
        title: title,
        description: successMsg + returnedValue,
      });
      return returnedValue;
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: `${title} Error`,
        description: error instanceof Error ? error.message : errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreatePlayer = async () => {
    await handlerWrapper(initializePlayer, "Player created", "Transaction signature: ", "Error creating player");
  };

  const handleDeletePlayer = async () => {
    await handlerWrapper(deletePlayer, "Player deleted", "Transaction signature: ", "Error deleting player");
  }

  const handleCreateGame = async () => {
    await handlerWrapper(() => createGame(0.1), "Game created", "Game PDA: ", "Error creating game");
  };

  const handleCommitMove = async () => {
    if (!connected) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const moveSalt = await commitMove(gamePda, Move.Rock);
      toast({
        title: "Move committed",
        description: `Move Salt: ${moveSalt}...`,
      });
    } catch (error) {
      console.error("Error committing move:", error);
      toast({
        title: "Error committing move",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevealMove = async () => {
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Terminal className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Solana Program Test</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 border border-gaming-accent rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Player Management</h2>
          <Button
            onClick={handleCreatePlayer}
            disabled={isLoading || !connected}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Initialize Player
          </Button>
          <Button
            onClick={handleDeletePlayer}
            disabled={isLoading || !connected}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Delete Player
          </Button>
        </div>

        <div className="p-4 border border-gaming-accent rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Game Management</h2>
          <Button
            onClick={handleCreateGame}
            disabled={isLoading || !connected}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create Game (0.1 SOL)
          </Button>
        </div>

        <div className="p-4 border border-gaming-accent rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Game</h2>
          <Button
            onClick={handleCommitMove}
            disabled={isLoading || !connected}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Commit Move (Rock)
          </Button>
          <Button
            onClick={handleRevealMove}
            disabled={isLoading || !connected}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Reveal Move
          </Button>
        </div>
      </div>

      <div className="mt-8 p-4 border border-gaming-accent rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Connection Status</h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span>{connected ? "Connected" : "Not connected"}</span>
        </div>
      </div>
    </div>
  );
}