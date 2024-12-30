'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Box } from "lucide-react";

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
  const targetScore = 5;

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

  const renderInventoryCount = (count: number) => (
    <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-gaming-primary/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold text-white">
      <Box className="w-3 h-3" />
      <span>{count}</span>
    </div>
  );

  return (
    <div className="px-4 py-6 space-y-8">
      {/* Opponent's Side */}
      <Card className="bg-gaming-card border-gaming-accent shadow-lg backdrop-blur-sm">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gaming-text-primary text-lg">
                {opponent ? opponent.display_name : 'Waiting for opponent...'}
              </h3>
              <div className="text-gaming-text-secondary">
                Score: {opponentScore}/{targetScore}
              </div>
            </div>
            <div className="flex space-x-6 text-2xl text-gaming-text-primary">
              <div className="relative">
                <span>🪨</span>
                {renderInventoryCount(opponentInventory.rock)}
              </div>
              <div className="relative">
                <span>📄</span>
                {renderInventoryCount(opponentInventory.paper)}
              </div>
              <div className="relative">
                <span>✂️</span>
                {renderInventoryCount(opponentInventory.scissors)}
              </div>
            </div>
          </div>
          <Progress 
            value={(opponentScore / targetScore) * 100} 
            className="h-2 bg-gaming-accent"
          />
        </div>
      </Card>

      {/* Battle Area */}
      <div className="h-48 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gaming-accent/5 rounded-lg backdrop-blur-sm" />
        {selectedMove ? (
          <div className="text-8xl animate-bounce relative z-10">
            {renderMoveIcon(selectedMove)}
          </div>
        ) : (
          <div className="text-3xl font-bold bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent">
            VS
          </div>
        )}
      </div>

      {/* Player's Side */}
      <Card className="bg-gaming-card border-gaming-accent shadow-lg backdrop-blur-sm">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gaming-text-primary text-lg">You</h3>
              <div className="text-gaming-text-secondary">
                Score: {playerScore}/{targetScore}
              </div>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                className="hover:bg-gaming-accent/20 text-3xl h-16 w-16 rounded-xl transition-all duration-200 transform hover:scale-110 text-gaming-text-primary disabled:opacity-50 disabled:cursor-not-allowed relative"
                disabled={playerInventory.rock === 0}
                onClick={() => setSelectedMove('rock')}
              >
                🪨
                {renderInventoryCount(playerInventory.rock)}
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-gaming-accent/20 text-3xl h-16 w-16 rounded-xl transition-all duration-200 transform hover:scale-110 text-gaming-text-primary disabled:opacity-50 disabled:cursor-not-allowed relative"
                disabled={playerInventory.paper === 0}
                onClick={() => setSelectedMove('paper')}
              >
                📄
                {renderInventoryCount(playerInventory.paper)}
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-gaming-accent/20 text-3xl h-16 w-16 rounded-xl transition-all duration-200 transform hover:scale-110 text-gaming-text-primary disabled:opacity-50 disabled:cursor-not-allowed relative"
                disabled={playerInventory.scissors === 0}
                onClick={() => setSelectedMove('scissors')}
              >
                ✂️
                {renderInventoryCount(playerInventory.scissors)}
              </Button>
            </div>
          </div>
          <Progress 
            value={(playerScore / targetScore) * 100} 
            className="h-2 bg-gaming-accent"
          />
        </div>
      </Card>
    </div>
  );
};