'use client';

import { useState } from "react";
import { UserSearch } from "@/components/arena/UserSearch";
import { GameArena } from "@/components/arena/GameArena";
import { usePlayerStats } from "@/hooks/usePlayerStats";

interface Opponent {
  did: string;
  display_name: string;
}

const ArenaPage = () => {
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const playerStats = usePlayerStats();
  
  const playerInventory = {
    rock: playerStats.rock_count,
    paper: playerStats.paper_count,
    scissors: playerStats.scissors_count,
  };

  // For now, we'll keep opponent inventory static
  const opponentInventory = {
    rock: 3,
    paper: 3,
    scissors: 3,
  };

  return (
    <div className="min-h-screen bg-gaming-background text-gaming-text-primary pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <UserSearch onSelectOpponent={setOpponent} />
        <GameArena 
          playerInventory={playerInventory}
          opponentInventory={opponentInventory}
          opponent={opponent}
          playerRating={playerStats.rating}
        />
      </div>
    </div>
  );
};

export default ArenaPage;
