import { Scissors, FileText, HandMetal } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameMoveDisplayProps {
  move: string | null;
  isWinner?: boolean;
  isDraw?: boolean;
}

export const GameMoveDisplay = ({ move, isWinner, isDraw }: GameMoveDisplayProps) => {
  const getMoveIcon = (move: string | null) => {
    const iconClassName = cn(
      "w-8 h-8 transition-all duration-300",
      isDraw ? "text-gaming-primary" :
      isWinner ? "text-gaming-success" : 
      "text-gaming-text-secondary"
    );

    switch (move) {
      case '0': return <HandMetal className={iconClassName} />;
      case '1': return <FileText className={iconClassName} />;
      case '2': return <Scissors className={iconClassName} />;
      default: return <div className="w-8 h-8 rounded-full bg-gaming-accent/20" />;
    }
  };

  return (
    <div className="relative group">
      {getMoveIcon(move)}
      {(isWinner || isDraw) && (
        <div className={cn(
          "absolute inset-0 rounded-full animate-ping opacity-75 group-hover:opacity-100",
          isDraw ? "bg-gaming-primary/10" : "bg-gaming-success/10"
        )} />
      )}
    </div>
  );
};