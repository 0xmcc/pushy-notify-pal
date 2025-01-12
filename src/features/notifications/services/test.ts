import { toast } from 'sonner';

export const sendTestNotification = async (supported: boolean, permission: NotificationPermission) => {
  if (!supported) {
    toast.error("Notifications not supported");
    return;
  }

  if (permission !== 'granted') {
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