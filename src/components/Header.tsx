import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AvatarPreview from './profile/AvatarPreview';

export const Header = () => {
  const { user } = usePrivy();
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('did', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  return (
    <header className="fixed top-0 left-0 right-0 p-4 z-50 bg-white/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto flex justify-end items-center">
        <AvatarPreview 
          previewUrl={null} 
          avatarUrl={avatarUrl}
          size="sm"
        />
      </div>
    </header>
  );
};