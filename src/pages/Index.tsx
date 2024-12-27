import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NotificationButton from '@/components/NotificationButton';
import { Bell } from 'lucide-react';

const Index = () => {
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

export default Index;