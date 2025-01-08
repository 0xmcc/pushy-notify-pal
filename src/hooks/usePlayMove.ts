'use client';

import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { playGameMove } from "@/utils/gameUtils";

export const usePlayMove = (isOffline?: boolean) => {
  const { user, authenticated } = usePrivy();

  const handlePlayMove = async (gameId: string, move: string) => {
    if (!authenticated) {
      toast.error("Please sign in to play");
      return;
    }

 
    if (user?.id) {
      try {
        console.log("Playing move:", { gameId, move, userId: user.id });
        await playGameMove(gameId, move, user.id);
        toast.success("Move played successfully!");
      } catch (err) {
        console.error("Error playing move:", err);
        toast.error("Failed to play move. Please try again.");
      }
    }
  };

  return handlePlayMove;
}; 