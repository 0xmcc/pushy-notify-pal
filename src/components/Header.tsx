import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./header/Logo";
import { ProfileButton } from "./header/ProfileButton";
import { NavigationTabs } from "./header/NavigationTabs";
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  className?: string;
}

export const Header = ({ className }: HeaderProps) => {
  const { user } = usePrivy();
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('did', user.id)
          .single();
        
        if (!error && data) {
          setAvatarUrl(data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`);
        }
      }
    };

    fetchUserAvatar();
  }, [user]);

  const handleAvatarUpdate = (url: string) => {
    setAvatarUrl(url);
  };

  return (
    <header className={cn(
      "h-20 bg-gaming-background border-b border-gaming-card flex items-center justify-between px-4",
      className
    )}>
      <div className="flex items-center space-x-8">
        <Logo />
        <div className="hidden md:block">
          <NavigationTabs />
        </div>
      </div>
      <ProfileButton avatarUrl={avatarUrl} onAvatarUpdate={handleAvatarUpdate} />
    </header>
  );
};