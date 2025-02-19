import { Scissors, FileText, HandMetal } from "lucide-react";
import { cn } from "@/lib/utils";

function RockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 1200 1200" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
     <path d="m680.73 500.06-59.762-73.223 0.67188-268.25 21.434-7.3203 297.86 64.777 183.55 264.98-118.39 460.27-267.82 109.99-134.52-1.1992 137.84-149.14-120.24-266.04zm-341.23-245.18 212.35-72.48-0.67188 269.28 48.359 59.281-54.742 124.27 114.05 252.31-149.28 161.59-179.04-96.266-30.07-96.938-110.76-32.855-63.504-246.38 197.02-176.04zm-64.535-51.84-18.289 163.54-208.58 186.39 83.977 325.85 112.8 33.48 27.457 88.633 219.41 117.94 260.14 2.3516 313.01-128.57 135.12-525.2-217.44-313.92-343.54-74.711zm-121.9 771.89-115.56-29.543-37.512 89.23 23.039 61.895 114 20.711 52.871-65.23zm47.762-697.23-78.434-15.047-45.91 35.762 11.594 54.121 74.762 19.922 32.93-30.602z" fill="currentColor" fillRule="evenodd"/>
    </svg>
  );
}

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
      case '0': return <RockIcon className={iconClassName} />;
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