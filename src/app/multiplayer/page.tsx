'use client';

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CreateGame } from "@/components/multiplayer/create-game/CreateGame";
import { ActiveGames } from "@/components/multiplayer/ActiveGames";
import { StakeRange } from "@/components/multiplayer/StakeRange";
import { useUser } from '@/contexts/UserProvider';

const MultiplayerPage = () => {
  const { userStats } = useUser();
  useEffect(() => {
    console.log("MCC multiplayer page useEffect", userStats);
  }, [userStats]);
  const [stakeRange, setStakeRange] = useState<[number, number]>([0, 1000]);

  return (
    <div className="container mx-auto py-6 px-4 bg-gaming-background">
      <h1 className="text-2xl font-bold text-center mb-6 text-gaming-text-primary">Multiplayer</h1>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-4 bg-gaming-card border-gaming-accent">
          <StakeRange value={stakeRange} onChange={setStakeRange} />
        </Card>
        
        <Card className="p-4 bg-gaming-card border-gaming-accent">
          <CreateGame />
        </Card>
        
        <Card className="p-4 bg-gaming-card border-gaming-accent">
          <h2 className="text-lg font-semibold mb-4 text-gaming-text-primary">Available Games</h2>
          <ActiveGames stakeRange={stakeRange} />
        </Card>
      </div>
    </div>
  );
};

export default MultiplayerPage;