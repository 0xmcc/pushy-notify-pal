'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function Header() {
  const { login, authenticated, user } = usePrivy();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('did', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const handleAvatarClick = () => {
    if (authenticated) {
      navigate('/');
    } else {
      login();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="container h-full mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-purple-900">
            RPS Arena
          </span>
        </div>

        <Avatar 
          className="w-8 h-8 cursor-pointer transition-transform hover:scale-105"
          onClick={handleAvatarClick}
        >
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}