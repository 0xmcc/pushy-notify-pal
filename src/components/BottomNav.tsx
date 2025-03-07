import { Home, Swords, Users, Terminal } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  className?: string;
}

export const BottomNav = ({ className }: BottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className={cn(
      "h-20 bg-[#1A1F2C] border-t border-[#222222] flex items-center justify-around px-4 backdrop-blur-sm bg-opacity-95",
      className
    )}>
      <button
        onClick={() => navigate("/multiplayer")}
        className={`flex flex-col items-center ${
          location.pathname === "/multiplayer" 
            ? "text-gaming-primary" 
            : "text-[#8E9196] hover:text-[#D6BCFA]"
        } transition-colors duration-200`}
      >
        <Home size={24} />
        <span className="text-xs mt-1">Home</span>
      </button>
      <button
        onClick={() => navigate("/arena")}
        className={`flex flex-col items-center ${
          location.pathname === "/arena" 
            ? "text-gaming-primary" 
            : "text-[#8E9196] hover:text-[#D6BCFA]"
        } transition-colors duration-200`}
      >
        <Swords size={24} />
        <span className="text-xs mt-1">History</span>
      </button>
      {/* <button
        onClick={() => navigate("/multiplayer")}
        className={`flex flex-col items-center ${
          location.pathname === "/multiplayer" 
            ? "text-gaming-primary" 
            : "text-[#8E9196] hover:text-[#D6BCFA]"
        } transition-colors duration-200`}
      >
        <Users size={24} />
        <span className="text-xs mt-1">Multi</span>
      </button> */}
      {/* <button
        onClick={() => navigate("/test")}
        className={`flex flex-col items-center ${
          location.pathname === "/test" 
            ? "text-gaming-primary" 
            : "text-[#8E9196] hover:text-[#D6BCFA]"
        } transition-colors duration-200`}
      >
        <Terminal size={24} />
        <span className="text-xs mt-1">Test</span>
      </button> */}
    </div>
  );
};