import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bell } from 'lucide-react';
import NotificationButton from '@/components/NotificationButton';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationSection = () => {
  const [isIOS, setIsIOS] = useState(false);
  const { supported, sendTestNotification, unsubscribeFromNotifications } = useNotifications();

  useEffect(() => {
    // Check if running on iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);
    
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

  return (
    <div className="space-y-4 mt-6">
      <NotificationButton />
      
      <Button 
        onClick={sendTestNotification}
        className="w-full h-12 bg-gaming-card hover:bg-gaming-accent/80 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Bell className="w-5 h-5" />
        <span>Send Test Notification</span>
      </Button>

      <Button 
        onClick={unsubscribeFromNotifications}
        variant="destructive"
        className="w-full h-12 flex items-center justify-center gap-2"
      >
        <Bell className="w-5 h-5" />
        <span>Disable Notifications</span>
      </Button>

      {!supported && (
        <div className="text-gaming-warning text-sm text-center p-2 bg-gaming-card/50 rounded-lg">
          Your browser doesn't support notifications
        </div>
      )}

      {isIOS && (
        <div className="text-gaming-text-secondary text-xs text-center mt-4">
          Make sure to add this page to your home screen for the best experience
        </div>
      )}
    </div>
  );
};

export default NotificationSection;