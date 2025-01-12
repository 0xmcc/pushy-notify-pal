import { Button } from "@/components/ui/button";
import { BellRing, RefreshCw } from 'lucide-react';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useEffect } from "react";

const NotificationButton = () => {
  const { permission, requestPermission } = useNotifications();
  
  useEffect(() => {
    console.log('NotificationButton: Permission state:', permission);
  }, [permission]);

  const handleRefreshSubscription = async () => {
    console.log('NotificationButton: Requesting permission...');
    try {
      await requestPermission();
      console.log('NotificationButton: Permission request completed');
    } catch (error) {
      console.error('NotificationButton: Permission request failed:', error);
    }
  };

  return permission === 'granted' ? (
    <Button 
      onClick={handleRefreshSubscription}
      className="w-full h-12 bg-gaming-success hover:bg-gaming-success/90 flex items-center justify-center gap-2"
    >
      <RefreshCw className="w-5 h-5" />
      <span>Refresh Subscription</span>
    </Button>
  ) : (
    <Button
      onClick={handleRefreshSubscription}
      className="w-full h-12 bg-gradient-to-r from-gaming-primary to-gaming-secondary hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
    >
      <BellRing className="w-5 h-5" />
      <span>Enable Notifications</span>
    </Button>
  );
};

export default NotificationButton;