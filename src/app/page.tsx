'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Scissors } from 'lucide-react';
import WalletSection from '@/components/WalletSection';
import NotificationSection from '@/components/NotificationSection';
import OnboardingFlow from '@/components/OnboardingFlow';

const HomePage = () => {
  const { authenticated, user } = usePrivy();
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  // Check if user has completed profile
  useEffect(() => {
    const checkProfile = async () => {
      if (authenticated && user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('display_name, avatar_url')
            .eq('did', user.id)
            .maybeSingle();

          if (error) {
            console.error('Error checking profile:', error);
            toast.error('Failed to load profile');
            return;
          }

          setHasProfile(Boolean(data?.display_name && data?.avatar_url));
        } catch (error) {
          console.error('Error in checkProfile:', error);
          toast.error('Failed to load profile');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [authenticated, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-4 space-y-6">
      <div className="w-full max-w-md space-y-6">
        <div className="absolute top-4 left-4">
          <Scissors className="w-8 h-8 text-gray-900" />
        </div>

        <WalletSection />
        
        {authenticated && !hasProfile ? (
          <OnboardingFlow />
        ) : (
          <NotificationSection />
        )}
      </div>
    </div>
  );
};

export default HomePage;
