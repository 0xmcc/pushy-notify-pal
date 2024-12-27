'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

interface Inventory {
  rock: number;
  paper: number;
  scissors: number;
}

interface Opponent {
  did: string;
  display_name: string;
}

interface GameArenaProps {
  playerInventory: Inventory;
  opponentInventory: Inventory;
  opponent: Opponent | null;
}

export const GameArena = ({ playerInventory, opponentInventory, opponent }: GameArenaProps) => {
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const targetScore = 5; // Best of 9 means first to 5 wins

  const renderMoveIcon = (move: string) => {
    switch (move) {
      case 'rock':
        return '🪨';
      case 'paper':
        return '📄';
      case 'scissors':
        return '✂️';
      default:
        return null;
    }
  };

  return (
    <div className="px-4 py-6">
      {/* Opponent's Side */}
      <Card className="mb-8 p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="font-semibold">{opponent ? opponent.display_name : 'Waiting for opponent...'}</h3>
            <div className="text-sm text-muted-foreground">
              Score: {opponentScore}/{targetScore}
            </div>
          </div>
          <div className="flex space-x-4">
            <span>🪨 {opponentInventory.rock}</span>
            <span>📄 {opponentInventory.paper}</span>
            <span>✂️ {opponentInventory.scissors}</span>
          </div>
        </div>
        <Progress value={(opponentScore / targetScore) * 100} className="h-2" />
      </Card>

      {/* Battle Area */}
      <div className="h-32 flex items-center justify-center mb-8">
        {selectedMove ? (
          <div className="text-6xl animate-bounce">
            {renderMoveIcon(selectedMove)}
          </div>
        ) : (
          <div className="text-2xl font-bold text-purple-600">VS</div>
        )}
      </div>

      {/* Player's Side */}
      <Card className="mt-8 p-4">
        <div className="h-16 flex items-center justify-center mb-4">
          {/* Player's played card would go here */}
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">You</h3>
            <div className="text-sm text-muted-foreground">
              Score: {playerScore}/{targetScore}
            </div>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="ghost"
              className="hover:bg-purple-100 text-2xl"
              disabled={playerInventory.rock === 0}
              onClick={() => setSelectedMove('rock')}
            >
              🪨 {playerInventory.rock}
            </Button>
            <Button
              variant="ghost"
              className="hover:bg-purple-100 text-2xl"
              disabled={playerInventory.paper === 0}
              onClick={() => setSelectedMove('paper')}
            >
              📄 {playerInventory.paper}
            </Button>
            <Button
              variant="ghost"
              className="hover:bg-purple-100 text-2xl"
              disabled={playerInventory.scissors === 0}
              onClick={() => setSelectedMove('scissors')}
            >
              ✂️ {playerInventory.scissors}
            </Button>
          </div>
        </div>
        <Progress value={(playerScore / targetScore) * 100} className="h-2 mt-2" />
      </Card>
    </div>
  );
};