import { LogOut, Upload } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { WalletBalance } from '../wallet/WalletBalance';
import { NotificationControls } from './notifications/NotificationControls';
import { AvatarDisplay } from './avatar/AvatarDisplay';
import { WalletAddress } from './wallet/WalletAddress';
import { GameInventory } from './inventory/GameInventory';
import { useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { uploadFileToSupabase, sanitizeFilePath } from '@/utils/fileUpload';

interface ProfileButtonProps {
  avatarUrl: string;
  onAvatarUpdate: (url: string) => void;
}

export const ProfileButton = ({ avatarUrl, onAvatarUpdate }: ProfileButtonProps) => {
  const { user, authenticated, logout, login } = usePrivy();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const sanitizedUserId = sanitizeFilePath(user.id);
      const filePath = `${sanitizedUserId}-avatar.${fileExt}`;

      const result = await uploadFileToSupabase(file, filePath);

      if ('error' in result) {
        throw result.error;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: result.publicUrl })
        .eq('did', user.id);

      if (updateError) {
        throw updateError;
      }

      onAvatarUpdate(result.publicUrl);
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  console.log('Dropdown opened');
  // Check for overlay elements
  const overlayElement = document.querySelector('.overlay-class');
  if (overlayElement) {
    console.log('Overlay element found:', overlayElement);
    console.log('Overlay z-index:', window.getComputedStyle(overlayElement).zIndex);
  }

  // Check z-index of dropdown
  const dropdownElement = document.querySelector('.dropdown-menu');
  if (dropdownElement) {
    console.log('Dropdown z-index:', window.getComputedStyle(dropdownElement).zIndex);
  }

  return (
    <div className="flex items-center gap-4">
      <WalletBalance />
      <div className="flex items-center gap-2">
        {!authenticated && (
          <Button 
            variant="ghost" 
            onClick={login}
            className="text-gaming-text-primary"
          >
            Login
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 hover:bg-transparent hover:text-gaming-text-primary focus:bg-transparent">
              <AvatarDisplay 
                avatarUrl={avatarUrl}
                authenticated={authenticated}
                className="h-full w-full"
              />
            </Button>
          </DropdownMenuTrigger>
          {authenticated && (
            <DropdownMenuContent align="end" className="w-56 bg-gaming-card text-gaming-text-primary border-gaming-accent">
              <GameInventory />
              
              {user?.wallet && (
                <>
                  <WalletAddress address={user.wallet.address} />
                  <DropdownMenuSeparator className="bg-gaming-accent" />
                </>
              )}

              <DropdownMenuItem 
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Update Avatar</span>
              </DropdownMenuItem>
              
              <NotificationControls />
              
              <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};