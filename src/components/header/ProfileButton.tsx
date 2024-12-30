import { useRef, useState, useEffect } from 'react';
import { UserX, LogOut, BellRing, Bell } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { uploadFileToSupabase, sanitizeFilePath } from '@/utils/fileUpload';
import AvatarPreview from '../profile/AvatarPreview';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WalletBalance } from '../wallet/WalletBalance';

interface ProfileButtonProps {
  avatarUrl: string;
  onAvatarUpdate: (url: string) => void;
}

export const ProfileButton = ({ avatarUrl, onAvatarUpdate }: ProfileButtonProps) => {
  const { user, authenticated, logout } = usePrivy();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleAvatarClick = () => {
    if (user) {
      fileInputRef.current?.click();
    }
  };

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

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success("Notifications enabled!");
      } else if (result === 'denied') {
        toast.error("Notifications blocked");
      }
    } catch (error) {
      toast.error("Error requesting permission");
      console.error('Error requesting notification permission:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!('Notification' in window)) {
      toast.error("Notifications not supported");
      return;
    }

    if (Notification.permission !== 'granted') {
      toast.error("Please enable notifications first");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Test Notification', {
        body: 'This is a test notification from your PWA!',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      });
      toast.success("Test notification sent!");
    } catch (error) {
      toast.error("Failed to send notification");
      console.error('Error sending notification:', error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <WalletBalance />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            {authenticated ? (
              <AvatarPreview 
                previewUrl={null} 
                avatarUrl={avatarUrl}
                size="xs"
              />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center text-gaming-text-secondary">
                <UserX className="w-5 h-5" />
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        {authenticated && (
          <DropdownMenuContent align="end" className="w-56 bg-gaming-card text-gaming-text-primary border-gaming-accent">
            {permission !== 'granted' && (
              <DropdownMenuItem onClick={requestPermission} className="gap-2">
                <BellRing className="w-4 h-4" />
                <span>Enable Notifications</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={sendTestNotification} className="gap-2">
              <Bell className="w-4 h-4" />
              <span>Send Test Notification</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
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
