import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GameCardWrapperProps {
  children: ReactNode;
  className?: string;
}

export const GameCardWrapper = ({ children, className }: GameCardWrapperProps) => {
  return (
    <div 
      className={cn(
        "relative overflow-hidden group",
        "bg-gaming-card/80 backdrop-blur-sm",
        "border border-gaming-accent/50",
        "rounded-lg p-6",
        "transition-all duration-300",
        "hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-gaming-primary/10 before:to-gaming-secondary/10",
        "before:opacity-0 before:transition-opacity before:duration-300",
        "hover:before:opacity-100",
        "after:absolute after:inset-0",
        "after:bg-[url('/grid.svg')] after:bg-center after:bg-repeat",
        "after:opacity-5 after:transition-opacity after:duration-300",
        "hover:after:opacity-10",
        className
      )}
    >
      {children}
    </div>
  );
};