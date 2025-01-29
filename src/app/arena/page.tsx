'use client';

import { useState } from "react";
import { useArenaData } from "@/hooks/useArenaData";
import { PlayerList } from "@/components/arena/PlayerList";
import { GameArena } from "@/components/arena/GameArena";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const ArenaPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const { data: players, isLoading } = useArenaData();
  const playerStats = usePlayerStats();
  
  const filteredPlayers = players?.filter(player =>
    player.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const playerInventory = {
    rock_count: playerStats.rock_count || 0,
    paper_count: playerStats.paper_count || 0,
    scissors_count: playerStats.scissors_count || 0,
  };

  // Default opponent inventory
  const opponentInventory = {
    rock_count: 3,
    paper_count: 3,
    scissors_count: 3,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gaming-background text-gaming-text-primary p-4">
        <div className="max-w-2xl mx-auto animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gaming-card rounded-lg mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gaming-background text-gaming-text-primary pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gaming-card border-gaming-accent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gaming-text-secondary" />
        </div>

        {!selectedPlayer ? (
          <PlayerList 
            players={filteredPlayers || []}
            onSelectPlayer={setSelectedPlayer}
            selectedPlayer={selectedPlayer}
          />
        ) : (
          <>
            <button 
              onClick={() => setSelectedPlayer(null)}
              className="mb-4 text-gaming-text-secondary hover:text-gaming-text-primary transition-colors"
            >
              ← Back to player list
            </button>
            <GameArena 
              playerInventory={playerInventory}
              opponentInventory={opponentInventory}
              opponent={{
                did: selectedPlayer.did,
                display_name: selectedPlayer.display_name
              }}
              playerRating={playerStats.rating || 0}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ArenaPage;
