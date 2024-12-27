'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const OnboardingFlow = () => {
  const { user } = usePrivy();
  const [step, setStep] = useState(1);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setStep(2);
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    }
  };

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

  if (!user) return null;

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {step === 1 && (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Add a Profile Picture</h2>
          <p className="text-gray-600">Choose an avatar that represents you</p>
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Profile" />
              ) : (
                <AvatarFallback>
                  <Camera className="w-8 h-8 text-gray-400" />
                </AvatarFallback>
              )}
            </Avatar>
            <Button
              variant="outline"
              className="relative"
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              <input
                id="avatar-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
              Upload Photo
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
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
      )}
    </div>
  );
};

export default OnboardingFlow;