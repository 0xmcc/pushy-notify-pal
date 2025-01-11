import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { usePrivy } from "@privy-io/react-auth";

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

/**
 * Simple function to send a push notification with basic options
 */


export const sendSimplePushNotification = async (
  recipientDid: string,
  gameId: string,
  title: string = "Your opponent made a move!",
  message: string = "It's your turn to play",
  link?: string
): Promise<boolean> => {
  const options: NotificationOptions = {
    title,
    body: message,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {
      gameId,
      url: `/game/${gameId}`
    }  };

  return sendPushNotification(recipientDid, options);
};

export const useNotifications = () => {
  const { user } = usePrivy();
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
      // Check for Safari Push first
      if ('safari' in window && 'pushNotification' in window.safari) {
        console.log('Safari push notifications available');
        const permissionData = window.safari.pushNotification.permission('web.com.roigame.roi');
        return checkRemotePermission(permissionData);
      }
      const result = await Notification.requestPermission();
      console.log('NOTIF2 Request permission result:', result);
      setPermission(result);
      
      if (result === 'granted') {
        // Get the service worker registration
        const registration = await navigator.serviceWorker.ready;
        
        // Get push subscription
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
        });
        console.log('NOTIF2 Subscription:', subscription);

        // Store subscription in database for the current user
        if (user?.id) {
          const { error } = await supabase
            .from('users')
            .update({ 
              push_subscription: JSON.stringify(subscription)
            })
            .eq('did', user.id);

          if (error) {
            console.error('Failed to store push subscription:', error);
            toast.error("Failed to enable notifications");
            return;
          }
        }
        console.log('Notification subscription stored successfully', subscription);
        toast.success("Notifications enabled!");
      } else if (result === 'denied') {
        toast.error("Notifications blocked");
      }
    } catch (error) {
      toast.error("Error requesting permission");
      console.error('Error requesting notification permission:', error);
    }
  };
  const checkRemotePermission = (permissionData: any) => {
    console.log("Safari permission state:", permissionData.permission);
    
    if (permissionData.permission === 'default') {
      // Request permission
      window.safari.pushNotification.requestPermission(
        'https://roi-game.vercel.app/',     // Your server URL
        'web.com.roigame.roi',         // Your Website Push ID
        {},                            // Extra data if needed
        checkRemotePermission          // Callback for handling response
      );
    } else if (permissionData.permission === 'granted') {
      // Handle granted permission
      const token = permissionData.deviceToken;
      console.log("Got device token:", token);
      
      // Store the Safari subscription if needed
      if (user?.id) {
        const safariSubscription = {
          type: 'safari',
          token: token,
          pushId: 'web.com.roigame.roi'
        };
        
        const { error } = await supabase
          .from('users')
          .update({ 
            push_subscription: JSON.stringify(safariSubscription)
          })
          .eq('did', user.id);
  
        if (error) {
          console.error('Failed to store Safari push subscription:', error);
          toast.error("Failed to enable notifications");
          return;
        }
      }
      toast.success("Safari notifications enabled!");
    } else if (permissionData.permission === 'denied') {
      // Handle denied permission
      toast.error("Safari notifications denied");
    }
  };

  const unsubscribeFromNotifications = async () => {
    try {
      // First, get all service worker registrations
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('NOTIF2 All SW registrations:', registrations);
      const result = await Notification.permission;
      // change permission to denied

      console.log('NOTIF2 Permission:', result);


      // Try to unsubscribe from all registrations
      for (const registration of registrations) {
        console.log('NOTIF2 Checking registration with scope:', registration.scope);
        console.log('NOTIF2 pushmanager:', registration.pushManager);
        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;
        console.log('NOTIF2 Service worker is ready');
        
        const subscription = await registration.pushManager.getSubscription();

        console.log('NOTIF2 Found subscription:', subscription);

        if (subscription) {
          // Unsubscribe from push notifications
          await subscription.unsubscribe();
          
          // Remove subscription from database
          if (user?.id) {
            const { error } = await supabase
              .from('users')
              .update({ 
                push_subscription: null 
              })
              .eq('did', user.id);

            if (error) {
              console.error('Failed to remove push subscription:', error);
              toast.error("Failed to disable notifications");
              return;
            }
          }
          console.log('NOTIF2 Successfully unsubscribed from notifications', permission);
          setPermission('denied')
          toast.success("Notifications disabled!");
          return;
        }
      }
      
      // If we get here, we didn't find any subscriptions
      console.log('NOTIF2 No active subscriptions found');
      
      // Try to clear the database entry anyway
      if (user?.id) {
        await supabase
          .from('users')
          .update({ 
            push_subscription: null 
          })
          .eq('did', user.id);
      }
      
      toast.success("Notifications disabled!");
    } catch (error) {
      toast.error("Error disabling notifications");
      console.error('Error unsubscribing from notifications:', error);
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
    sendTestNotification,
    unsubscribeFromNotifications
  };
};