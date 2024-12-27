import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProfileFormProps {
  avatarUrl: string;
}

const ProfileForm = ({ avatarUrl }: ProfileFormProps) => {
  const { user } = usePrivy();
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Please enter a display name');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          display_name: displayName,
          avatar_url: avatarUrl 
        })
        .eq('did', user?.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      navigate('/arena');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="Enter your display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Complete Profile'}
      </Button>
    </form>
  );
};

export default ProfileForm;