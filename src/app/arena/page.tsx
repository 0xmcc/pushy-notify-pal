'use client';

import { useState } from "react";
import { UserSearch } from "@/components/arena/UserSearch";
import { GameArena } from "@/components/arena/GameArena";

interface Inventory {
  rock: number;
  paper: number;
  scissors: number;
}

const ArenaPage = () => {
  const [opponent, setOpponent] = useState<string>("");
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
    <div className="container mx-auto max-w-2xl px-4">
      <div className="space-y-8">
        <UserSearch onSelectOpponent={setOpponent} />
        <GameArena 
          playerInventory={playerInventory}
          opponentInventory={opponentInventory}
        />
      </div>
    </div>
  );
};

export default ArenaPage;