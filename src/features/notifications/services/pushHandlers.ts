//import { updateSubscription } from './subscription';
import { toast } from 'sonner';
import { getVapidKey } from './vapidService';

// Request notification permission
const requestPermission = async (setPermission) => {
    const result = await Notification.requestPermission();
    console.log('Web Push permission result:', result);
    setPermission(result);
    return result;
  };
  
  // Send subscription to backend
  const sendSubscriptionToBackend = async (userId, subscription) => {
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to send subscription to backend:', errorData);
        return false;
      }
  
      console.log('Subscription successfully sent to backend');
      return true;
    } catch (error) {
      console.error('Error sending subscription to backend:', error);
      return false;
    }
  };
  
  // Handle existing subscription
  const handleExistingSubscription = async (userId, existingSubscription) => {
    console.log('Found existing subscription:', existingSubscription, userId);
    return await sendSubscriptionToBackend(userId, existingSubscription);
  };
  
  // Create and save a new subscription
  const createAndSaveSubscription = async (userId, vapidKey, registration) => {
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKey,
    });
  
    return await sendSubscriptionToBackend(userId, newSubscription);
  };
  
  // Main function to handle Web Push
  export const handleWebPush = async (user, setPermission) => {
    try {
      // Step 1: Request notification permission
      const permission = await requestPermission(setPermission);
      if (permission !== 'granted') {
        toast.error("Notifications not allowed");
        return;
      }
  
      // Step 2: Get service worker registration and VAPID key
      const registration = await navigator.serviceWorker.ready;
      const vapidKey = await getVapidKey();
  
      // Step 3: Check for existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        const refreshed = await handleExistingSubscription(user?.id, existingSubscription);
        if (refreshed) {
          toast.success("Subscription refreshed!");
          return;
        }
  
        console.log('Refreshing failed, creating a new subscription...');
        await existingSubscription.unsubscribe(); // Unsubscribe if existing subscription fails
      }
  
      // Step 4: Create and save a new subscription
      const created = await createAndSaveSubscription(user?.id, vapidKey, registration);
      if (created) {
        toast.success("Notifications enabled!");
      } else {
        toast.error("Failed to enable notifications");
      }
    } catch (error) {
      console.error('Error in handleWebPush:', error);
      toast.error("Failed to enable notifications");
    }
  };


// export const handleWebPush = async (user: any, setPermission: any) => {
//     try {

//       const result = await Notification.requestPermission();
//       console.log('Web Push permission result:', result);
//       setPermission(result);
      
//       if (result === 'granted') {
//         const registration = await navigator.serviceWorker.ready;
//         const vapidKey = await getVapidKey();
        
//         // Check for existing subscription
//         const existingSubscription = await registration.pushManager.getSubscription();
//         if (existingSubscription) {
//           console.log('Found existing subscription:', existingSubscription, user?.id);
          
//           try {
//             // Try to use existing subscription
//             if (user?.id && await updateSubscription(user.id, existingSubscription, null)) {
//               toast.success("Subscription refreshed!");
//               return;
//             }
//           } catch (error) {
//             console.log('Error with existing subscription:', error);
//             // If there's an error, unsubscribe and create new one
//             await existingSubscription.unsubscribe();
//           }
//         }
  
//         // Create new subscription
//         const newSubscription = await registration.pushManager.subscribe({
//           userVisibleOnly: true,
//           applicationServerKey: vapidKey
//         });
        
//         if (user?.id && await updateSubscription(user.id, newSubscription, null)) {
//           toast.success("Notifications enabled!");
//         }
//       }
//     } catch (error) {
//       console.error('Error in handleWebPush:', error);
//       toast.error("Failed to enable notifications");
//     }
//   }; 

//import { SafariSubscription } from '../types';
//import { supabase } from '@/integrations/supabase/client';
// const checkRemotePermission = (permissionData: any) => {
//   if (permissionData.permission === 'granted') {
//     toast.success("Safari notifications enabled!");
//   } else if (permissionData.permission === 'denied') {
//     toast.error("Safari push notifications denied");
//   }
// };
// export const handleSafariPush = async (permissionData: any, user: any) => {
//   console.log("Safari permission state:", permissionData.permission);
  
//   if (permissionData.permission === 'default') {
//     window.safari.pushNotification.requestPermission(
//       'https://roi-game.vercel.app/',
//       'web.com.roigame.roi',
//       {},
//       checkRemotePermission
//     );
//   } else if (permissionData.permission === 'granted') {
//     const token = permissionData.deviceToken;
//     console.log("Got Safari device token:", token);
    
//     if (user?.id) {
//       // Update user's safari_push_subscription in Supabase
//       const { error } = await supabase
//         .from('users')
//         .update({ 
//           safari_push_subscription: {
//             token,
//             pushId: 'web.com.roigame.roi'
//           }
//         })
//         .eq('did', user.id);

//       if (error) {
//         console.error('Error updating Safari subscription:', error);
//         toast.error("Failed to save notification settings");
//         return;
//       }
      
//       toast.success("Safari notifications enabled!");
//     }
//   }
// };
