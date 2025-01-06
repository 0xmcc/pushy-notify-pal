import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from '@supabase/supabase-js';

export const setupRealtimeSubscription = (
  onUpdate: () => void
): RealtimeChannel => {
  console.log("Setting up realtime subscription for matches");
  
  const channel = supabase
    .channel('matches_changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public',
        table: 'matches'
      },
      (payload) => {
        console.log("Received realtime update:", payload);
        onUpdate();
      }
    )
    .subscribe((status) => {
      console.log("Realtime subscription status:", status);
    });

  return channel;
};