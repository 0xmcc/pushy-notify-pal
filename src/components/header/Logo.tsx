import { Swords } from "lucide-react";
import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <Swords className="w-6 h-6 text-gaming-primary" />
      <span className="font-bold text-xl text-gaming-text-primary"></span>
    </Link>
  );
};