import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Wallet, LogOut } from 'lucide-react';
import { usePrivy, useCreateWallet } from '@privy-io/react-auth';

const WalletSection = () => {
  const { login, authenticated, user, logout } = usePrivy();
  const { createWallet } = useCreateWallet();

  const handleWalletConnect = async () => {
    if (!authenticated) {
      await login();
    } else if (user && !user.wallet) {
      try {
        const wallet = await createWallet();
        toast.success("Wallet created successfully!");
      } catch (error) {
        toast.error("Failed to create wallet");
        console.error('Error creating wallet:', error);
      }
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
      <Button
        onClick={handleWalletConnect}
        className="w-full h-12 bg-purple-500 hover:bg-purple-600 transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <Wallet className="w-5 h-5" />
        <span>{authenticated ? 'Create Wallet' : 'Connect Wallet'}</span>
      </Button>

      {authenticated && (
        <Button
          onClick={handleLogout}
          className="w-full h-12 bg-red-500 hover:bg-red-600 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      )}

      {authenticated && user && user.wallet && (
        <div className="p-4 bg-white rounded-lg shadow space-y-2">
          <p className="text-sm font-medium text-gray-700">Wallet Address:</p>
          <p className="text-xs bg-gray-50 p-2 rounded break-all">{user.wallet.address}</p>
        </div>
      )}
    </div>
  );
};

export default WalletSection;