// import { useState, useEffect } from 'react';
// import { usePrivy } from "@privy-io/react-auth";
// import { toast } from "sonner";
// import { isIOSSafari, isPWA, isWebPushSupported } from '@/utils/browser';
// import { handleSafariPush, handleWebPush } from '@/features/notifications/services/pushHandlers';

// export const useNotifications = () => {
//   const { user } = usePrivy();
//   const [permission, setPermission] = useState<NotificationPermission>('default');
//   const [supported, setSupported] = useState(false);

//   useEffect(() => {
//     setSupported('Notification' in window);
//     if ('Notification' in window) {
//       setPermission(Notification.permission);
//     }
//   }, []);

//   const requestPermission = async () => {
//     try {
//       console.log('useNotifications: Starting permission request');
//       console.log('marko');
//       // Log environment
//       console.log('Environment checks:', {
//         isPWA: isPWA(),
//         isIOSSafari: isIOSSafari(),
//         isWebPushSupported: isWebPushSupported()
//       });

//       // Check if we're in PWA mode first
//       if (isPWA()) {
//         console.log('useNotifications: Using Web Push (PWA mode)');
//         return handleWebPush(user, setPermission);
//       }

//       // Only try Safari push if not in PWA
//       if (isIOSSafari()) {
//         console.log('useNotifications: Using Safari Push');
//         const permissionData = window.safari.pushNotification.permission('web.com.roigame.roi');
//         return handleSafariPush(permissionData, user);
//       }

//       console.log('useNotifications: Using standard Web Push');
//       return handleWebPush(user, setPermission);
//     } catch (error) {
//       console.error('useNotifications: Error in requestPermission:', error);
//       toast.error("Error requesting permission");
//     }
//   };

//   const unsubscribeFromNotifications = async () => {
//     try {
//       const registrations = await navigator.serviceWorker.getRegistrations();
//       console.log('NOTIF2 All SW registrations:', registrations);

//       for (const registration of registrations) {
//         const subscription = await registration.pushManager.getSubscription();
//         if (subscription) {
//           await subscription.unsubscribe();
//           if (user?.id) {
//             await updateSubscription(user.id, null, null);
//           }
//           setPermission('denied');
//           toast.success("Notifications disabled!");
//           return;
//         }
//       }
      
//       // Clear database if no active subscriptions
//       if (user?.id) {
//         await updateSubscription(user.id, null, null);
//       }
//       toast.success("Notifications disabled!");
//     } catch (error) {
//       toast.error("Error disabling notifications");
//       console.error('Error unsubscribing from notifications:', error);
//     }
//   };

//   const sendTestNotification = async () => {
//     if (!supported) {
//       toast.error("Notifications not supported");
//       return;
//     }

//     if (permission !== 'granted') {
//       toast.error("Please enable notifications first");
//       return;
//     }

//     try {
//       const registration = await navigator.serviceWorker.ready;
//       await registration.showNotification('Test Notification', {
//         body: 'This is a test notification from your PWA!',
//         icon: '/icon-192x192.png',
//         badge: '/icon-192x192.png',
//       });
//       toast.success("Test notification sent!");
//     } catch (error) {
//       toast.error("Failed to send notification");
//       console.error('Error sending notification:', error);
//     }
//   };

//   return {
//     permission,
//     supported,
//     requestPermission,
//     sendTestNotification,
//     unsubscribeFromNotifications
//   };
// };