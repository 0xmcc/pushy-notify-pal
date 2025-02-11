'use client';

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Share2 } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { supabase } from "@/integrations/supabase/client";
import { useCreateGame } from "@/hooks/useCreateGame";

// Sub-components
function GameHeader({ playerName, elo, balance, avatarUrl }: { playerName: string; elo: number; balance: string; avatarUrl: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="relative">
        <img
          src={avatarUrl}
          alt="Player avatar"
          className="w-16 h-16 rounded-full border-2 border-amber-500"
        />
        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-xs px-1 rounded">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold">{playerName}</h2>
        <p className="text-slate-400">{elo} ELO</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="text-amber-500">{balance}</span>
      </div>
    </div>
  );
}

function MoveButton({
  move,
  isSelected,
  isDisabled,
  onSelect,
}: {
  move: { name: string; count: number; icon: string; beats: string };
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (moveName: string) => void;
}) {
  const [hoveredMove, setHoveredMove] = useState<string | null>(null);

  return (
    <button
      onClick={() => onSelect(move.name)}
      onMouseEnter={() => setHoveredMove(move.name)}
      onMouseLeave={() => setHoveredMove(null)}
      className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 
        ${isSelected ? "border-green-500 bg-green-900/30" : "border-slate-700 bg-slate-800/50"}
        transition-all duration-300 hover:scale-105 group
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:border-amber-500 hover:bg-slate-700/50"}
      `}
      disabled={isDisabled}
    >
      <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform">{move.icon}</div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{move.name}</span>
        <span className="text-amber-500 font-bold">{move.count}</span>
      </div>
      {/* Particle Effects */}
      <div className={`absolute inset-0 pointer-events-none ${hoveredMove === move.name || isSelected ? "opacity-100" : "opacity-0"}`}>
        <div className="absolute top-0 left-1/2 w-px h-8 bg-gradient-to-b from-amber-500/0 via-amber-500/50 to-amber-500/0 animate-glow" />
        <div className="absolute bottom-0 left-1/2 w-px h-8 bg-gradient-to-t from-amber-500/0 via-amber-500/50 to-amber-500/0 animate-glow" />
      </div>
    </button>
  );
}

function GameActions({
  moves,
  selectedMove,
  onMoveSelect,
  inventory,
}: {
  moves: { name: string; count: number; icon: string; beats: string }[];
  selectedMove: string | null;
  onMoveSelect: (moveName: string) => void;
  inventory: any;
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {moves.map((move) => (
        <MoveButton
          key={move.name}
          move={move}
          isSelected={selectedMove === move.name}
          isDisabled={selectedMove !== null && selectedMove !== "" && selectedMove !== move.name}
          onSelect={onMoveSelect}
        />
      ))}
    </div>
  );
}

function SelectionView({ selectedMove, onInvite }: { selectedMove: string | null; onInvite: () => void }) {
  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Hey! Want to play Rock Paper Scissors? I've already selected my move 😅 ${window.location.href}invite`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
      // Fallback to regular invite if sharing fails
      onInvite();
    }
  };

  return (
    <div className="text-center mb-6">
      {selectedMove ? (
        <>
          <p className="text-lg mb-4">
            You selected: <span className="font-bold text-amber-500">{selectedMove}</span>
          </p>
          <Button
            onClick={handleShare}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2 px-4 rounded-full transition-colors duration-300"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Invite a Friend to Play
          </Button>
        </>
      ) : (
        <p className="text-lg"></p>
      )}
    </div>
  );
}

// Main component
export const UserGameCard = () => {
  const { user, authenticated } = usePrivy();
  const playerStats = usePlayerStats();
  const [userAvatar, setUserAvatar] = useState<string>("");
  const { selectedMove, setSelectedMove, isCreating, handleCreateGame } = useCreateGame();
  const [hoveredMove, setHoveredMove] = useState<string | null>(null);

  const preDefinedStake = 10; // Pre-defined stake amount

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('did', user.id)
          .single();
        
        if (!error && data) {
          setUserAvatar(data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`);
        }
      }
    };

    fetchUserAvatar();
  }, [user?.id]);

  const moves = [
    { name: "Rock", count: playerStats.rock_count, icon: "🪨", beats: "Scissors" },
    { name: "Paper", count: playerStats.paper_count, icon: "📄", beats: "Rock" },
    { name: "Scissors", count: playerStats.scissors_count, icon: "✂️", beats: "Paper" },
  ];

  return (
    <Card className="relative w-[400px] bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white border-none">
      <GameHeader playerName={user?.display_name || "Player"} elo={user?.rating || 0} balance={`${preDefinedStake} SOL`} avatarUrl={userAvatar} />
      <SelectionView 
        selectedMove={selectedMove} 
        onInvite={() => user?.id && handleCreateGame(user.id)}
      />
      <GameActions
        moves={moves}
        selectedMove={selectedMove}
        onMoveSelect={setSelectedMove}
        inventory={playerStats}
      />
    </Card>
  );
}; 