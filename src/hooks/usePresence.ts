import { useEffect } from 'react';
import { userSupabase } from '../lib/supabase';

export function usePresence(userId: string) {
  useEffect(() => {
    // Update presence on mount
    const channel = userSupabase.channel(`presence:${userId}`)
      .on('presence', { event: 'sync' }, () => {
        // Update presence state
        channel.track({
          user_id: userId,
          last_seen_at: new Date().toISOString()
        });
      });

    // Subscribe to presence channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Start tracking presence
        await channel.track({
          user_id: userId,
          last_seen_at: new Date().toISOString()
        });
      }
    });

    // Update presence every 15 seconds while active
    const interval = setInterval(() => {
      channel.track({
        user_id: userId,
        last_seen_at: new Date().toISOString()
      });
    }, 15000);

    // Cleanup
    return () => {
      clearInterval(interval);
      userSupabase.removeChannel(channel);
    };
  }, [userId]);
}