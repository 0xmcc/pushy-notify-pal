'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Inventory {
  rock: number;
  paper: number;
  scissors: number;
}

interface User {
  did: string;
  rating: number;
}

const ArenaPage = () => {
  const [opponent, setOpponent] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
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

  const searchUsers = async (searchTerm: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('did, rating')
        .ilike('did', `%${searchTerm}%`)
        .limit(5);

      if (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users');
        return;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error in searchUsers:', error);
      toast.error('Failed to search users');
    }
  };

  useEffect(() => {
    if (opponent.length >= 3) {
      searchUsers(opponent);
    } else {
      setSearchResults([]);
    }
  }, [opponent]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20">
      {/* Search Section */}
      <div className="p-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for opponent..."
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white rounded-lg shadow-lg p-2 space-y-2">
            {searchResults.map((user) => (
              <div
                key={user.did}
                className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                onClick={() => setOpponent(user.did)}
              >
                <span className="text-sm font-medium">{user.did}</span>
                <span className="text-sm text-gray-500">Rating: {user.rating}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Game Arena */}
      <div className="px-4 py-6">
        {/* Opponent's Side */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Opponent</h3>
            <div className="flex space-x-4">
              <span>🪨 {opponentInventory.rock}</span>
              <span>📄 {opponentInventory.paper}</span>
              <span>✂️ {opponentInventory.scissors}</span>
            </div>
          </div>
          <div className="h-32 bg-purple-100 rounded-lg flex items-center justify-center">
            {/* Opponent's played card would go here */}
          </div>
        </div>

        {/* Battle Area */}
        <div className="h-24 flex items-center justify-center">
          <div className="text-2xl font-bold text-purple-600">VS</div>
        </div>

        {/* Player's Side */}
        <div className="mt-8">
          <div className="h-32 bg-blue-100 rounded-lg flex items-center justify-center">
            {/* Player's played card would go here */}
          </div>
          <div className="flex justify-between items-center mt-2">
            <h3 className="font-semibold">You</h3>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                className="hover:bg-purple-100"
                disabled={playerInventory.rock === 0}
              >
                🪨 {playerInventory.rock}
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-purple-100"
                disabled={playerInventory.paper === 0}
              >
                📄 {playerInventory.paper}
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-purple-100"
                disabled={playerInventory.scissors === 0}
              >
                ✂️ {playerInventory.scissors}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArenaPage;