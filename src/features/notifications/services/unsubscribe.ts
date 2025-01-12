import { toast } from 'sonner';
import { updateSubscription } from './subscription';

export const unsubscribeFromNotifications = async (userId: string | undefined, setPermission: (permission: NotificationPermission) => void) => {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log('NOTIF2 All SW registrations:', registrations);

    for (const registration of registrations) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        if (userId) {
          await updateSubscription(userId, null, null);
        }
        setPermission('denied');
        toast.success("Notifications disabled!");
        return;
      }
    }
    
    if (userId) {
      await updateSubscription(userId, null, null);
    }
    toast.success("Notifications disabled!");
  } catch (error) {
    toast.error("Error disabling notifications");
    console.error('Error unsubscribing from notifications:', error);
  }
}; 