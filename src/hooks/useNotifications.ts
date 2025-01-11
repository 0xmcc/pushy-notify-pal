import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    [key: string]: any;
  };
}

/**
 * Sends a push notification to a specific user by their DID
 */
export const sendPushNotification = async (
  recipientDid: string, 
  options: NotificationOptions
): Promise<boolean> => {
  try {
    // 1. Get recipient's push subscription from database
    const { data, error } = await supabase
      .from('users')
      .select('push_subscription')
      .eq('did', recipientDid)
      .single();

    if (error || !data?.push_subscription) {
      console.log('No push subscription found for user:', recipientDid);
      return false;
    }

    // 2. Send to our backend endpoint which will handle the actual push
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: JSON.parse(data.push_subscription),
        notification: options
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported('Notification' in window);
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

  return {
    permission,
    supported,
    requestPermission,
    sendTestNotification
  };
};