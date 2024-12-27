'use client';

import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import WalletSection from '@/components/WalletSection';
import NotificationSection from '@/components/NotificationSection';

const HomePage = () => {
  const { authenticated, user } = usePrivy();

  // Add user to Supabase when authenticated
  useEffect(() => {
    const addUserToSupabase = async () => {
      if (authenticated && user) {
        try {
          const { error } = await supabase
            .from('users')
            .upsert({ 
              did: user.id,
              rating: 1200 
            }, { 
              onConflict: 'did'
            });

          if (error) {
            console.error('Error adding user to Supabase:', error);
            toast.error('Failed to sync user data');
          }
        } catch (error) {
          console.error('Error in addUserToSupabase:', error);
          toast.error('Failed to sync user data');
        }
      }
    };

    addUserToSupabase();
  }, [authenticated, user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-4 space-y-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">Push Notifications Demo</h1>
          <p className="text-gray-600 text-sm">
            Test push notifications on your device
          </p>
        </div>

        <NotificationSection />
        <WalletSection />
      </div>
    </div>
  );
};

export default HomePage;