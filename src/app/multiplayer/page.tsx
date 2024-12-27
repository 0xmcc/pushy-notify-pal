'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CreateGame } from "@/components/multiplayer/CreateGame";
import { ActiveGames } from "@/components/multiplayer/ActiveGames";
import { StakeRange } from "@/components/multiplayer/StakeRange";

const MultiplayerPage = () => {
  const [stakeRange, setStakeRange] = useState<[number, number]>([0, 1000]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Multiplayer</h1>
      
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="p-4">
          <StakeRange value={stakeRange} onChange={setStakeRange} />
        </Card>
        
        <Card className="p-4">
          <CreateGame />
        </Card>
        
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Available Games</h2>
          <ActiveGames stakeRange={stakeRange} />
        </Card>
      </div>
    </div>
  );
};

export default MultiplayerPage;