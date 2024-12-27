import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Wallet, LogOut } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

const WalletSection = () => {
  const { login, authenticated, logout } = usePrivy();

  const handleWalletConnect = async () => {
    if (!authenticated) {
      await login();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="space-y-4">
      {!authenticated && (
        <Button
          onClick={handleWalletConnect}
          className="w-full h-12 bg-gradient-to-r from-gaming-primary to-gaming-secondary hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2 text-white"
        >
          <Wallet className="w-5 h-5" />
          <span>Connect Wallet</span>
        </Button>
      )}

      {authenticated && (
        <Button
          onClick={handleLogout}
          className="w-full h-12 bg-gradient-to-r from-gaming-danger to-gaming-warning hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2 text-white"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      )}
    </div>
  );
};

export default WalletSection;