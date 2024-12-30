import { Swords } from 'lucide-react';

export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <Swords className="w-6 h-6 text-gaming-primary" />
      <span className="font-semibold text-gaming-text-primary">Rock Paper Scissors</span>
    </div>
  );
};