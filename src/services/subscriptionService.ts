import { supabase } from '@/integrations/supabase/client';
import { SafariSubscription } from '@/types/notifications';
import { toast } from 'sonner';

export const updateSubscription = async (userId: string, webPush: any = null, safariPush: SafariSubscription | null = null) => {
  const { error } = await supabase
    .from('users')
    .update({ 
      web_push_subscription: webPush,
      safari_push_subscription: safariPush
    })
    .eq('did', userId);

  if (error) {
    console.error('Failed to store push subscription:', error);
    toast.error("Failed to enable notifications");
    return false;
  }
  return true;
}; 