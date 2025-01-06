import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type SubscriptionConfig = {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  schema?: string;
};

class RealtimeService {
  private static channels: Map<string, RealtimeChannel> = new Map();
  private static subscribers: Map<string, Set<Function>> = new Map();

  private static log(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RealtimeService] ${message}`, data || '');
    }
  }

  private static getChannelId(config: SubscriptionConfig): string {
    return `${config.table}-${config.event || '*'}-${config.filter || 'all'}`;
  }

  static subscribe(config: SubscriptionConfig, callback: Function) {
    const channelId = this.getChannelId(config);
    
    // Create new channel if doesn't exist
    if (!this.channels.has(channelId)) {
      this.log(`Creating new channel: ${channelId}`);

      const channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          {
            event: config.event || '*',
            schema: config.schema || 'public',
            table: config.table,
            filter: config.filter
          },
          (payload) => {
            this.log(`Received update on ${channelId}:`, payload);
            this.subscribers.get(channelId)?.forEach(cb => cb(payload));
          }
        )
        .subscribe((status) => {
          this.log(`Channel ${channelId} status:`, status);
        });

      this.channels.set(channelId, channel);
      this.subscribers.set(channelId, new Set());
    }

    // Add subscriber
    this.subscribers.get(channelId)?.add(callback);
    this.log(`New subscriber added to ${channelId}. Total subscribers: ${this.subscribers.get(channelId)?.size}`);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(channelId)?.delete(callback);
      this.log(`Subscriber removed from ${channelId}. Remaining: ${this.subscribers.get(channelId)?.size}`);
      
      // Clean up channel if no subscribers left
      if (this.subscribers.get(channelId)?.size === 0) {
        this.log(`Cleaning up channel ${channelId} - no subscribers left`);
        const channel = this.channels.get(channelId);
        if (channel) {
          supabase.removeChannel(channel);
          this.channels.delete(channelId);
          this.subscribers.delete(channelId);
        }
      }
    };
  }

  // Add a method to force cleanup (useful for logout scenarios)
  static cleanup() {
    this.log('Cleaning up all channels');
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.subscribers.clear();
  }
}

export default RealtimeService;
