import { Button } from "@/components/ui/button";

interface MoveButtonProps {
  move: string;
  emoji: string;
  count: number;
  isSelected: boolean;
  onSelect: (move: string) => void;
}

export const MoveButton = ({ move, emoji, count, isSelected, onSelect }: MoveButtonProps) => {
  const capitalizedMove = move.charAt(0).toUpperCase() + move.slice(1);
  
  return (
    <Button
      variant={isSelected ? 'default' : 'outline'}
      onClick={() => onSelect(move)}
      className="flex-1 relative group"
      disabled={count === 0}
    >
      <div className="absolute -top-3 -right-2 bg-gaming-primary px-2 py-1 rounded-full text-xs text-white transform group-hover:scale-110 transition-transform">
        {count}
      </div>
      {emoji} {capitalizedMove}
    </Button>
  );
};