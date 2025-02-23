import { supabase } from "@/integrations/supabase/client";
import { NotificationOptions } from "../types";

export const sendGameNotification = async (recipientDid: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('web_push_subscription, safari_push_subscription')
    .eq('did', recipientDid)
    .single();

  if (error) throw error;
  
  // No subscriptions available
  if (!data?.web_push_subscription && !data?.safari_push_subscription) return;

  const options: NotificationOptions = {
    title: "New Game Created",
    body: "Your game has been created successfully!"
  };

  // Try web push first, then safari push if available
  const subscription = data.web_push_subscription || data.safari_push_subscription;

  await fetch('/api/notifications/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscription: JSON.parse(subscription),
      notification: options
    })
  });
}; 