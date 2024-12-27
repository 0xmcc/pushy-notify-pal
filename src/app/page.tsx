'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NotificationButton from '@/components/NotificationButton';
import { Bell, Wallet } from 'lucide-react';
import { usePrivy, useCreateWallet } from '@privy-io/react-auth';

const HomePage = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(false);
  const { login, ready, authenticated, user } = usePrivy();
  const { createWallet } = useCreateWallet();

  useEffect(() => {
    // Check if running on iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);
    
    // Check if notifications are supported
    setNotificationSupported('Notification' in window);
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  const sendTestNotification = async () => {
    if (!('Notification' in window)) {
      toast.error("Notifications not supported");
      return;
    }

    if (Notification.permission !== 'granted') {
      toast.error("Please enable notifications first");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Test Notification', {
        body: 'This is a test notification from your PWA!',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      });
      toast.success("Test notification sent!");
    } catch (error) {
      toast.error("Failed to send notification");
      console.error('Error sending notification:', error);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-4 space-y-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">Push Notifications Demo</h1>
          <p className="text-gray-600 text-sm">
            {isIOS ? "iOS 16.4+ required for push notifications" : "Test push notifications on your device"}
          </p>
        </div>

        <div className="space-y-4">
          <NotificationButton />
          
          <Button 
            onClick={sendTestNotification}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Bell className="w-5 h-5" />
            <span>Send Test Notification</span>
          </Button>

          <Button
            onClick={handleWalletConnect}
            className="w-full h-12 bg-purple-500 hover:bg-purple-600 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Wallet className="w-5 h-5" />
            <span>{authenticated ? 'Create Wallet' : 'Connect Wallet'}</span>
          </Button>

          {authenticated && user && (
            <div className="p-4 bg-white rounded-lg shadow space-y-2">
              <p className="text-sm font-medium text-gray-700">Access Token:</p>
              <p className="text-xs bg-gray-50 p-2 rounded break-all">{user?.token}</p>
              {user.wallet && (
                <>
                  <p className="text-sm font-medium text-gray-700">Wallet Address:</p>
                  <p className="text-xs bg-gray-50 p-2 rounded break-all">{user.wallet.address}</p>
                </>
              )}
            </div>
          )}

          {!notificationSupported && (
            <div className="text-amber-600 text-sm text-center p-2 bg-amber-50 rounded-lg">
              Your browser doesn't support notifications
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-500 mt-8">
          {isIOS && (
            <p>
              Make sure to add this page to your home screen for the best experience
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
