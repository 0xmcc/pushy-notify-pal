import { Home, Swords, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-gaming-background border-t border-gaming-accent flex items-center justify-around px-4">
      <button
        onClick={() => navigate("/")}
        className={`flex flex-col items-center space-y-1 ${
          location.pathname === "/" ? "text-gaming-primary" : "text-gaming-text-secondary"
        }`}
      >
        <Home size={24} />
        <span className="text-xs">Home</span>
      </button>
      <button
        onClick={() => navigate("/arena")}
        className={`flex flex-col items-center space-y-1 ${
          location.pathname === "/arena" ? "text-gaming-primary" : "text-gaming-text-secondary"
        }`}
      >
        <Swords size={24} />
        <span className="text-xs">Arena</span>
      </button>
      <button
        onClick={() => navigate("/multiplayer")}
        className={`flex flex-col items-center space-y-1 ${
          location.pathname === "/multiplayer" ? "text-gaming-primary" : "text-gaming-text-secondary"
        }`}
      >
        <Users size={24} />
        <span className="text-xs">Multiplayer</span>
      </button>
    </div>
  );
};