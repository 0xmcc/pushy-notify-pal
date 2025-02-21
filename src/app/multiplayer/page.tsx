'use client';

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CreateGame } from "@/components/multiplayer/create-game/CreateGame";
import { ActiveGames } from "@/components/multiplayer/ActiveGames";
import { StakeRange } from "@/components/multiplayer/StakeRange";
import { useUser } from '@/contexts/UserProvider';
import { usePrivy } from "@privy-io/react-auth";
import { playGameMove } from "@/utils/gameUtils";
import { toast } from "sonner";

const MultiplayerPage = () => {
  const { userStats, replenishmentTimers, refreshReplenishmentTimers, nextReplenishmentTimer } = useUser();
  const { user, authenticated } = usePrivy();
  const [stakeRange, setStakeRange] = useState<[number, number]>([0, 1000]);

  const handlePlayMove = async (gameId: string, move: string) => {
    if (!authenticated) {
      toast.error("Please sign in to play");
      return;
    }

    if (!navigator.onLine) {
      toast.error("Cannot play moves while offline");
      return;
    }

    if (user?.id) {
      try {
        console.log("Playing move:", { gameId, move, userId: user.id });
        await playGameMove(gameId, move, user.id);
        refreshReplenishmentTimers();
      } catch (err) {
        console.error("Error playing move:", err);
        toast.error("Failed to play move. Please try again.");
      }
    }
  };

  useEffect(() => {
    console.log("MCC multiplayer page useEffect", userStats);
  }, [userStats]);

  return (
    <div className="container mx-auto py-6 px-4 bg-gaming-background">
      <h1 className="text-2xl font-bold text-center mb-6 text-gaming-text-primary">Your Move</h1>
      
      <div className="max-w-2xl mx-auto space-y-6">
        {/* <Card className="p-4 bg-gaming-card border-gaming-accent">
          <StakeRange value={stakeRange} onChange={setStakeRange} />
        </Card> */}
        
        <Card className="p-4 bg-gaming-card border-gaming-accent">
          <CreateGame />
        </Card>
        
        <Card className="p-4 bg-gaming-card border-gaming-accent">
          <h2 className="text-lg font-semibold mb-4 text-gaming-text-primary">Available Games</h2>
          <ActiveGames stakeRange={stakeRange} onPlayMove={handlePlayMove} />
        </Card>
      </div>
    </div>
  );
};

export default MultiplayerPage;