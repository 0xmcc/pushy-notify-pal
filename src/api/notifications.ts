import express from 'express';
import webpush from 'web-push';

const router = express.Router();

webpush.setVapidDetails(
  'mailto:markocalvocruz@gmail.com',
  import.meta.env.VITE_VAPID_PUBLIC_KEY!,
  import.meta.env.VITE_VAPID_PRIVATE_KEY!
);

router.post('/send', async (req, res) => {
  console.log('📨 Notification request received');
  console.log('Request body:', req.body);
  
  try {
    const { subscription, notification } = req.body;
    console.log('Subscription:', subscription);
    console.log('Notification:', notification);

    await webpush.sendNotification(subscription, JSON.stringify(notification));
    console.log('✅ Notification sent successfully');
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

export default router; 