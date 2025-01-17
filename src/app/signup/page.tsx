'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { MatrixRain } from '@/components/effects/MatrixRain';

export default function SignupPage() {
  const navigate = useNavigate();
  const { user } = usePrivy();
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('users')
        .insert([
          {
            did: user.id,
            display_name: displayName,
            // Set initial inventory
            rock_count: 5,
            paper_count: 5,
            scissors_count: 5,
            rating: 1200, // Initial rating
            matches_played: 0,
            matches_won: 0,
            matches_lost: 0,
            matches_drawn: 0,
            off_chain_balance: 100
          },
        ]);

      if (error) throw error;

      toast.success('Profile created successfully!');
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
              Complete Your Profile
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Display Name
                </label>
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                  className="w-full bg-gaming-background/50 border-gaming-accent text-gaming-text-primary"
                  placeholder="Enter your display name"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-gaming-primary to-gaming-secondary hover:opacity-90 text-gaming-text-primary"
              >
                {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 