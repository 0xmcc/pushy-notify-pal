import { Button } from "@/components/ui/button";
import { Box } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GameMoveSelectorProps {
  selectedMove: string;
  onMoveSelect: (move: string) => void;
}

interface Inventory {
  rock_count: number;
  paper_count: number;
  scissors_count: number;
}

export const GameMoveSelector = ({ selectedMove, onMoveSelect }: GameMoveSelectorProps) => {
  const { user } = usePrivy();
  const [inventory, setInventory] = useState<Inventory>({
    rock_count: 0,
    paper_count: 0,
    scissors_count: 0
  });

  useEffect(() => {
    const fetchInventory = async () => {
      if (user?.id) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('rock_count, paper_count, scissors_count')
          .eq('did', user.id)
          .single();

        if (!error && userData) {
          setInventory(userData);
        }
      }
    };

    fetchInventory();

    // Set up real-time subscription for inventory updates
    const channel = supabase
      .channel('inventory-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `did=eq.${user?.id}`
        },
        (payload) => {
          setInventory({
            rock_count: payload.new.rock_count,
            paper_count: payload.new.paper_count,
            scissors_count: payload.new.scissors_count
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gaming-text-primary">
        Select your move
      </label>
      <div className="flex gap-2">
        <Button
          variant={selectedMove === 'rock' ? 'default' : 'outline'}
          onClick={() => onMoveSelect('rock')}
          className="flex-1 relative group"
          disabled={inventory.rock_count === 0}
        >
          <div className="absolute -top-3 -right-2 bg-gaming-primary px-2 py-1 rounded-full text-xs text-white transform group-hover:scale-110 transition-transform">
            <Box className="w-3 h-3 inline-block mr-1" />
            {inventory.rock_count}
          </div>
          🪨 Rock
        </Button>
        <Button
          variant={selectedMove === 'paper' ? 'default' : 'outline'}
          onClick={() => onMoveSelect('paper')}
          className="flex-1 relative group"
          disabled={inventory.paper_count === 0}
        >
          <div className="absolute -top-3 -right-2 bg-gaming-primary px-2 py-1 rounded-full text-xs text-white transform group-hover:scale-110 transition-transform">
            <Box className="w-3 h-3 inline-block mr-1" />
            {inventory.paper_count}
          </div>
          📄 Paper
        </Button>
        <Button
          variant={selectedMove === 'scissors' ? 'default' : 'outline'}
          onClick={() => onMoveSelect('scissors')}
          className="flex-1 relative group"
          disabled={inventory.scissors_count === 0}
        >
          <div className="absolute -top-3 -right-2 bg-gaming-primary px-2 py-1 rounded-full text-xs text-white transform group-hover:scale-110 transition-transform">
            <Box className="w-3 h-3 inline-block mr-1" />
            {inventory.scissors_count}
          </div>
          ✂️ Scissors
        </Button>
      </div>
    </div>
  );
};