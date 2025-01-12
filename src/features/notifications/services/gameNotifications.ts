import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || ''; // Add this to your .env

export const sendSimplePushNotification = async (
  userId: string,
  gameId: string,
  title: string,
  body: string,
  url?: string
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/send`, {
        method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        gameId,
        title,
        body,
        url
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send push notification');
    }
  } catch (error) {
    console.error('Error sending game notification:', error);
    toast.error("Failed to send notification");
  }
};

// Simpler version
export const sendNotification = async (
  userId: string,
  title: string,
  message: string,
) => {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title,
        message
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send push notification');
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    toast.error("Failed to send notification");
  }
}; 