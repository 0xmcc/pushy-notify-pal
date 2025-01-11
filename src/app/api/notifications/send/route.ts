import webpush from 'web-push';

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  try {
    const { subscription, notification } = await request.json();

    // Send the push notification using web-push
    await webpush.sendNotification(
      subscription,
      JSON.stringify(notification)
    );

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send notification' }), 
      { status: 500 }
    );
  }
} 