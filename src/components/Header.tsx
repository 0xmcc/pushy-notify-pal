import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from './header/Logo';
import { ProfileButton } from './header/ProfileButton';
import { WalletBalance } from './wallet/WalletBalance';

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
    <header className="fixed top-0 left-0 right-0 py-1 z-50 bg-gaming-background border-b border-gaming-accent">
      <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
        <Logo />
        <div className="flex items-center gap-4">
          <WalletBalance />
          <ProfileButton 
            avatarUrl={avatarUrl}
            onAvatarUpdate={setAvatarUrl}
          />
        </div>
      </div>
    </header>
  );
};