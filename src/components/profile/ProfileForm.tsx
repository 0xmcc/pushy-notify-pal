'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileFormProps {
  avatarUrl: string;
}

const ProfileForm = ({ avatarUrl }: ProfileFormProps) => {
  const { user } = usePrivy();
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !displayName.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          avatar_url: avatarUrl,
          display_name: displayName.trim()
        })
        .eq('did', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">What's your name?</h2>
        <p className="text-gray-600">This is how others will find you</p>
      </div>
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Enter your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="h-12"
        />
        <Button
          type="submit"
          className="w-full h-12"
          disabled={isSubmitting || !displayName.trim()}
        >
          {isSubmitting ? 'Saving...' : 'Complete Profile'}
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;