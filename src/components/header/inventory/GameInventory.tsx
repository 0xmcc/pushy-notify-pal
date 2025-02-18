import { Progress } from "@/components/ui/progress";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useUser } from '@/contexts/UserProvider';

interface GameInventoryItemProps {
  emoji: string;
  count: number;
  maxCount: number;
}

const GameInventoryItem = ({ emoji, count, maxCount }: GameInventoryItemProps) => {
  const progress = (count / maxCount) * 100;

  return (
    <div className="flex items-center gap-3 px-2 py-1.5">
      <span className="text-lg w-6 text-center">{emoji}</span>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-xs text-gaming-text-secondary">
          <span>{count}/{maxCount}</span>
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
  const { userStats, isLoading } = useUser();
  const maxCount = 5; // Maximum count for each item

  if (isLoading) {
    return (
      <div className="px-1 py-2 space-y-1 border-b border-gaming-accent opacity-50">
        <div className="text-xs text-gaming-text-secondary text-center">Loading inventory...</div>
      </div>
    );
  }

  if (!userStats) {
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
      />
      <GameInventoryItem 
        emoji="📄"
        count={userStats.paper_count}
        maxCount={maxCount}
      />
      <GameInventoryItem 
        emoji="✂️"
        count={userStats.scissors_count}
        maxCount={maxCount}
      />
    </div>
  );
}; 