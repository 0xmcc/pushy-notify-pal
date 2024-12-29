import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Wallet, LogOut } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';

const WalletSection = () => {
  const { login, authenticated, user, logout } = usePrivy();
  const { createWallet } = useSolanaWallets();

  const handleLogin = async () => {
    try {
      await login();
      toast.success('Successfully logged in');
    } catch (error) {
      toast.error('Failed to login');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleCreateWallet = async () => {
    try {
      const wallet = await createWallet();
      console.log('Created wallet:', wallet);
      toast.success('Successfully created wallet');
    } catch (error) {
      console.error('Failed to create wallet:', error);
      toast.error('Failed to create wallet');
    }
  };

  if (!authenticated) {
    return (
      <Button onClick={handleLogin} className="w-full">
        Connect Wallet
      </Button>
    );
  }

  // Show Create Wallet button and Logout if user is authenticated but has no wallet
  if (!user?.wallet) {
    return (
      <div className="space-y-2">
        <Button onClick={handleCreateWallet} className="w-full">
          Create Wallet
        </Button>
        <Button onClick={handleLogout} variant="outline" className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    );
  }

  // Show connected state and Logout if user has a wallet
  return (
    <div className="space-y-2">
      <div className="text-center">
        <p className="text-sm text-gaming-text-secondary mb-2">Connected Wallet</p>
        <p className="font-mono text-xs truncate">
          {user.wallet.address}
        </p>
      </div>
      <Button onClick={handleLogout} variant="outline" className="w-full">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};

export default WalletSection;