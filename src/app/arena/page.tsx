'use client';

import { useState } from "react";
import { UserSearch } from "@/components/arena/UserSearch";
import { GameArena } from "@/components/arena/GameArena";

interface Inventory {
  rock: number;
  paper: number;
  scissors: number;
}

interface Opponent {
  did: string;
  display_name: string;
}

const ArenaPage = () => {
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [playerInventory, setPlayerInventory] = useState<Inventory>({
    rock: 3,
    paper: 3,
    scissors: 3,
  });
  const [opponentInventory, setOpponentInventory] = useState<Inventory>({
    rock: 3,
    paper: 3,
    scissors: 3,
  });

  return (
    <div className="min-h-screen bg-gaming-background text-gaming-text-primary pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <UserSearch onSelectOpponent={setOpponent} />
        <GameArena 
          playerInventory={playerInventory}
          opponentInventory={opponentInventory}
          opponent={opponent}
        />
      </div>
    </div>
  );
};

export default ArenaPage;