//import { updateSubscription } from './subscription';
import { toast } from 'sonner';
import { getVapidKey } from './vapidService';

const API_BASE_URL = import.meta.env.VITE_API_URL || ''; // Add this to your .env

 // Send subscription to backend
 const sendSubscriptionToBackend = async (userId, subscription) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/subscribe`, {
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
      console.log('existingSubscription', existingSubscription);
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

// Request notification permission
const requestPermission = async (setPermission) => {
    const result = await Notification.requestPermission();
    console.log('Web Push permission result:', result);
    setPermission(result);
    return result;
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
  
 