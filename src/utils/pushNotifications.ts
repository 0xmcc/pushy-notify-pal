import { supabase } from "@/integrations/supabase/client";

// Function to send a push notification
export const sendPushNotification = async (userId: string, message: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{ user_id: userId, message }]);

    if (error) {
      throw new Error('Failed to send notification');
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

// Function to listen for notifications
export const listenForNotifications = (userId: string, onNotification: (message: string) => void) => {
  const channel = supabase
    .channel('notifications')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
      const notification = payload.new;
      if (notification.user_id === userId) {
        onNotification(notification.message);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
