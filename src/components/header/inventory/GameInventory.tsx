import { Progress } from "@/components/ui/progress";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useUser } from '@/contexts/UserProvider';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface GameInventoryItemProps {
  emoji: string;
  count: number;
  maxCount: number;
}

const Timer = ({ timestamp }: { timestamp: number }) => {
  const [formattedTime, setFormattedTime] = useState('0s');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const timeRemaining = Math.max(Math.floor(timestamp / 1000) - now, 0);
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      if (minutes > 0) {
        setFormattedTime(`${minutes}min`);
      } else {
        setFormattedTime(`${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <div className="text-xs text-gaming-text-secondary text-center mb-1 flex items-center gap-1">
      <Clock className="w-3 h-3" />
      {formattedTime}
    </div>
  );
};

const GameInventoryItem = ({ emoji, count, maxCount, timestamp }: GameInventoryItemProps & { timestamp: number }) => {
  const progress = (count / maxCount) * 100;

  return (
    <div className="flex items-center gap-3 px-2 py-1.5">
      <span className="text-lg w-6 text-center">{emoji}</span>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-center text-xs text-gaming-text-secondary">
          <span>{count}/{maxCount}</span>
          {count !== maxCount && <Timer timestamp={timestamp} />}
        </div>
        <Progress 
          value={progress} 
          className={cn(
            "h-1.5 bg-gaming-accent/30",
            count === 0 ? "[&>div]:bg-red-500" : "[&>div]:bg-gaming-accent"
          )}
        />
      </div>
    </div>
  );
};

export const GameInventory = () => {
  const { userStats, isLoading, replenishmentTimers } = useUser();
  const maxCount = 5; // Maximum count for each item

  if (isLoading) {
    return (
      <div className="px-1 py-2 space-y-1 border-b border-gaming-accent opacity-50">
        <div className="text-xs text-gaming-text-secondary text-center">Loading inventory...</div>
      </div>
    );
  }

  if (!userStats || !replenishmentTimers) {
    return (
      <div className="px-1 py-2 space-y-1 border-b border-gaming-accent opacity-50">
        <div className="text-xs text-gaming-text-secondary text-center">No inventory data</div>
      </div>
    );
  }

  return (
    <div className="px-1 py-2 space-y-1 border-b border-gaming-accent">
      <GameInventoryItem 
        emoji="🪨"
        count={userStats.rock_count}
        maxCount={maxCount}
        timestamp={replenishmentTimers.next_replenish.rock}
      />
      <GameInventoryItem 
        emoji="📄"
        count={userStats.paper_count}
        maxCount={maxCount}
        timestamp={replenishmentTimers.next_replenish.paper}
      />
      <GameInventoryItem 
        emoji="✂️"
        count={userStats.scissors_count}
        maxCount={maxCount}
        timestamp={replenishmentTimers.next_replenish.scissors}
      />
    </div>
  );
}; 