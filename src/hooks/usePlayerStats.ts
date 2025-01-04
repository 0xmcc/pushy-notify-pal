import { useState, useEffect, useRef, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';

export interface PlayerStats {
  rating: number;
  rock_count: number;
  paper_count: number;
  scissors_count: number;
}

export const usePlayerStats = (userId?: string) => {
  const { user } = usePrivy();
  const targetUserId = userId || user?.id;
  if (!targetUserId) {
    console.log('No target user ID provided');
//    return;
  } else {
    console.log('Target user ID provided:', targetUserId);
  }
  // Create a unique channel name for this specific subscription
  const channelName = `user-stats-${targetUserId}-${Math.random()}`;
  
  const [stats, setStats] = useState<PlayerStats>({
    rating: 1200,
    rock_count: 5,
    paper_count: 5,
    scissors_count: 5,
  });

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    
    const fetchStats = async () => {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return;

      const { data, error } = await supabase
        .from('users')
        .select('rating, rock_count, paper_count, scissors_count')
        .eq('did', targetUserId)
        .single();

      if (error) {
        console.error('Error fetching player stats:', error);
        return;
      }

      if (data && mounted.current) {
        console.log('Fetched inventory:', data);
        setStats({
          rating: data.rating,
          rock_count: data.rock_count,
          paper_count: data.paper_count,
          scissors_count: data.scissors_count
        });
      }
    };

    fetchStats();

    const channel = supabase
      .channel(channelName) // Unique channel name per user
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `did=eq.${targetUserId}`
        },
        (payload) => {
          console.log('usePlayerStats Inventory update received:', payload);
          if (payload.new && mounted.current) {
            const newStats = {
              rating: payload.new.rating,
              rock_count: payload.new.rock_count,
              paper_count: payload.new.paper_count,
              scissors_count: payload.new.scissors_count
            };
            console.log('Setting new stats:', newStats);
            setStats(newStats);
          }
        }
      )
      .subscribe();

    return () => {
      mounted.current = false;
      console.log(`Cleaning up subscription channel: ${channelName}`);

      supabase.removeChannel(channel);
    };
  }, [user?.id, userId]);

  // Prevent unnecessary updates
  const stableStats = useMemo(() => stats, [
    stats.rating,
    stats.rock_count,
    stats.paper_count,
    stats.scissors_count
  ]);

  return stableStats;
};




// export const usePlayerStats = (userId?: string) => {
//   const { user } = usePrivy();
//   const [stats, setStats] = useState<PlayerStats>({
//     rating: 1200,
//     rock_count: 5,
//     paper_count: 5,
//     scissors_count: 5,
  
//   });

//   useEffect(() => {
//     const fetchStats = async () => {
//       const targetUserId = userId || user?.id;
//       if (!targetUserId) return;

//       const { data, error } = await supabase
//         .from('users')
//         .select('rating, rock_count, paper_count, scissors_count')
//         .eq('did', targetUserId)
//         .single();

//       if (error) {
//         console.error('Error fetching player stats:', error);
//         return;
//       }

//       if (data) {
//         console.log('Fetched inventory:', data);
//         setStats({
// //          ...data,
//           rating: data.rating,
//           rock_count: data.rock_count,
//           paper_count: data.paper_count,
//           scissors_count: data.scissors_count
//         });
//       }
//     };

//     fetchStats();

//     // Set up real-time subscription for stats updates
//     const channel = supabase
//       .channel('user-stats')
//       .on(
//         'postgres_changes',
//         {
//           event: 'UPDATE',
//           schema: 'public',
//           table: 'users',
//           filter: `did=eq.${userId || user?.id}`
//         },
//         (payload) => {
//           console.log('usePlayerStats Inventory update received:', payload);
//           if (payload.new) {
//             setStats({
//               rating: payload.new.rating,
//               rock_count: payload.new.rock_count,
//               paper_count: payload.new.paper_count,
//               scissors_count: payload.new.scissors_count
              
//             });
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [user?.id, userId]);


//     // Add an effect to log whenever stats change
//     useEffect(() => {
//       console.log('player stats inventory state updated:', stats);
//     }, [stats]);
  
//   return stats;
// };