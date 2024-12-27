'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Inventory {
  rock: number;
  paper: number;
  scissors: number;
}

interface GameArenaProps {
  playerInventory: Inventory;
  opponentInventory: Inventory;
}

export const GameArena = ({ playerInventory, opponentInventory }: GameArenaProps) => {
  return (
    <div className="space-y-8">
      {/* Opponent's Side */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-purple-900">Opponent</h3>
          <div className="flex gap-4">
            <span className="px-3 py-1.5 bg-purple-50 rounded-full text-purple-900">🪨 {opponentInventory.rock}</span>
            <span className="px-3 py-1.5 bg-purple-50 rounded-full text-purple-900">📄 {opponentInventory.paper}</span>
            <span className="px-3 py-1.5 bg-purple-50 rounded-full text-purple-900">✂️ {opponentInventory.scissors}</span>
          </div>
        </div>
        <Card className="h-40 flex items-center justify-center bg-purple-50 border-purple-100">
          {/* Opponent's played card would go here */}
          <span className="text-purple-400 text-sm">Waiting for opponent...</span>
        </Card>
      </div>

      {/* Battle Area */}
      <div className="relative">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-purple-200" />
        <div className="relative flex justify-center">
          <span className="px-4 py-2 bg-white text-2xl font-bold text-purple-600">VS</span>
        </div>
      </div>

      {/* Player's Side */}
      <div>
        <Card className="h-40 flex items-center justify-center bg-blue-50 border-blue-100 mb-3">
          {/* Player's played card would go here */}
          <span className="text-blue-400 text-sm">Choose your move...</span>
        </Card>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-blue-900">You</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="hover:bg-blue-50 text-blue-900"
              disabled={playerInventory.rock === 0}
            >
              🪨 {playerInventory.rock}
            </Button>
            <Button
              variant="ghost"
              className="hover:bg-blue-50 text-blue-900"
              disabled={playerInventory.paper === 0}
            >
              📄 {playerInventory.paper}
            </Button>
            <Button
              variant="ghost"
              className="hover:bg-blue-50 text-blue-900"
              disabled={playerInventory.scissors === 0}
            >
              ✂️ {playerInventory.scissors}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};