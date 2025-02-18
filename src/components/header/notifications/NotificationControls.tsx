import { useState, useEffect } from 'react';
import { BellRing, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export const NotificationControls = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success("Notifications enabled!");
      } else if (result === 'denied') {
        toast.error("Notifications blocked");
      }
    } catch (error) {
      toast.error("Error requesting permission");
      console.error('Error requesting notification permission:', error);
    }
  };

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
    <>
      {permission === 'default' && (
        <DropdownMenuItem onClick={requestPermission} className="gap-2 cursor-pointer">
          <BellRing className="w-4 h-4" />
          <span>Enable Notifications</span>
        </DropdownMenuItem>
      )}
      {permission === 'granted' && (
        <DropdownMenuItem onClick={sendTestNotification} className="gap-2 cursor-pointer">
          <Bell className="w-4 h-4" />
          <span>Test Notification</span>
        </DropdownMenuItem>
      )}
    </>
  );
}; 