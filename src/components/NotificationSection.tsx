import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell } from 'lucide-react';
import NotificationButton from '@/components/NotificationButton';

const NotificationSection = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(false);

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

      {!notificationSupported && (
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