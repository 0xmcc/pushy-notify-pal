import { Gamepad2 } from 'lucide-react';

export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <Gamepad2 className="w-6 h-6 text-gaming-primary" />
      <span className="font-semibold text-gaming-text-primary">GameArena</span>
    </div>
  );
};