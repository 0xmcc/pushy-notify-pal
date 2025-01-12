import { supabase } from '@/integrations/supabase/client';
import { SafariSubscription } from '../types';
import { toast } from 'sonner';

export const updateSubscription = async (userId: string, webPush: any = null, safariPush: SafariSubscription | null = null) => {
    if (!userId) {
        console.error('updateSubscription: No user ID provided');
        return false;
    }
    if (!webPush && !safariPush) {
        console.error('updateSubscription: No push subscription provided');
        return false;
    }

    // Build update object only with non-null values
    const updateData: any = {};
    if (webPush !== null) {
        updateData.web_push_subscription = webPush;
    }
    if (safariPush !== null) {
        updateData.safari_push_subscription = safariPush;
    }

    const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('did', userId);

    if (error) {
        console.error('Failed to store push subscription:', error);
        toast.error("Failed to enable notifications");
        return false;
    }
    return true;
}; 