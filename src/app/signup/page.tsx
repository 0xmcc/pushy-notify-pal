'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { MatrixRain } from '@/components/effects/MatrixRain';
import { useCreateWallet } from '@/hooks/useCreateWallet';
import { DisplayNameStep } from '@/components/signup/DisplayNameStep';
import { AvatarStep } from '@/components/signup/AvatarStep';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  const navigate = useNavigate();
  const { user } = usePrivy();
  const { handleCreateWallet } = useCreateWallet();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateProfile = async (avatarUrl: string) => {
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      // Create user profile
      const { error } = await supabase
        .from('users')
        .insert([
          {
            did: user.id,
            display_name: displayName,
            avatar_url: avatarUrl,
            rock_count: 5,
            paper_count: 5,
            scissors_count: 5,
            rating: 1200,
            matches_played: 0,
            matches_won: 0,
            matches_lost: 0,
            matches_drawn: 0,
            off_chain_balance: 100
          },
        ]);

      if (error) throw error;

      // Create wallet after profile creation
      const wallet = await handleCreateWallet();
      if (!wallet) {
        toast.error('Failed to create wallet');
        // Still proceed with navigation since profile was created
      } else {
        toast.success('Profile and wallet created successfully!');
      }

      navigate('/');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gaming-text-primary relative overflow-hidden">
      {/* Matrix Rain Background */}
      <div className="fixed inset-0 z-0">
        <MatrixRain />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
      </div>

      {/* Content */}
      <div className="relative z-20">
        <div className="container max-w-lg mx-auto px-4 py-8">
          <div className="relative bg-gaming-background/80 backdrop-blur-sm p-8 rounded-lg border border-gaming-accent">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="absolute right-4 top-4 text-gaming-text-primary hover:text-gaming-text-primary/80"
            >
              <X className="w-6 h-6" />
            </Button>
            
            <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent">
              {step === 1 ? 'Choose Your Name' : 'Add Your Avatar'}
            </h1>

            {step === 1 ? (
              <DisplayNameStep
                displayName={displayName}
                setDisplayName={setDisplayName}
                onNext={() => setStep(2)}
                isSubmitting={isSubmitting}
              />
            ) : (
              <AvatarStep
                onNext={handleCreateProfile}
                onBack={() => setStep(1)}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 