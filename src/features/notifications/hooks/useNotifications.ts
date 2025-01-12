import { useState, useEffect } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { isIOSSafari, isPWA, isWebPushSupported } from '@/utils/browser';
import { handleSafariPush, handleWebPush } from '../services/pushHandlers';
import { sendTestNotification } from '../services/test';
import { unsubscribeFromNotifications } from '../services/unsubscribe';

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
    console.log('Safari requestPermission() CALLED', isPWA(), isWebPushSupported(), isIOSSafari());
    try {
        console.log('Safari requestPermission() CALLED', isPWA(), isWebPushSupported(), isIOSSafari());
        // Use Web Push for PWA
        if (isPWA() && isWebPushSupported()) {
            console.log('Safari requestPermission Using Web Push in PWA');
            return handleWebPush(user, setPermission);
        }
        else {
            console.error('Safari requestPermission() CALLED, but not in PWA or Web Push is not supported');
            toast.error('Requesting permission outside of PWA or Web Push is not supported');
            //throw new Error('Safari requestPermission() CALLED, but not in PWA or Web Push is not supported');
        }

    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error("Error requesting permission");
    }
  };

  const handleTestNotification = () => sendTestNotification(supported, permission);
  const handleUnsubscribe = () => unsubscribeFromNotifications(user?.id, setPermission);

  return {
    permission,
    supported,
    requestPermission,
    sendTestNotification: handleTestNotification,
    unsubscribeFromNotifications: handleUnsubscribe
  };
}; 


    //   // Use Safari Push for browser
    //   else if (isIOSSafari()) {
    //     console.log('Safari requestPermission Using Safari Push in browser');
    //     const permissionData = window.safari.pushNotification.permission('web.com.roigame.roi');
    //     return handleSafariPush(permissionData, user);
    //   }

    //   console.log('Safari requestPermission Using standard web push notifications');
    //   return handleWebPush(user, setPermission);