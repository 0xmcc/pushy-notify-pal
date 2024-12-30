import { Scissors, FileText, HandMetal } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameMoveDisplayProps {
  move: string | null;
  isWinner?: boolean;
}

export const GameMoveDisplay = ({ move, isWinner }: GameMoveDisplayProps) => {
  const getMoveIcon = (move: string | null) => {
    switch (move) {
      case '0': return <HandMetal className={cn(
        "w-8 h-8 transition-all duration-300",
        isWinner ? "text-gaming-success" : "text-gaming-text-secondary"
      )} />;
      case '1': return <FileText className={cn(
        "w-8 h-8 transition-all duration-300",
        isWinner ? "text-gaming-success" : "text-gaming-text-secondary"
      )} />;
      case '2': return <Scissors className={cn(
        "w-8 h-8 transition-all duration-300",
        isWinner ? "text-gaming-success" : "text-gaming-text-secondary"
      )} />;
      default: return <div className="w-8 h-8 rounded-full bg-gaming-accent/20" />;
    }
  };

  return (
    <div className="relative group">
      {getMoveIcon(move)}
      {isWinner && (
        <div className="absolute inset-0 bg-gaming-success/10 rounded-full 
                      animate-ping opacity-75 group-hover:opacity-100" />
      )}
    </div>
  );
};