import { useRef, useState, useEffect } from 'react';
import { UserX, LogOut, BellRing, Bell, Copy, Check } from 'lucide-react';
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { WalletBalance } from '../wallet/WalletBalance';

interface ProfileButtonProps {
  avatarUrl: string;
  onAvatarUpdate: (url: string) => void;
}

export const ProfileButton = ({ avatarUrl, onAvatarUpdate }: ProfileButtonProps) => {
  const { user, authenticated, logout, login } = usePrivy();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [copied, setCopied] = useState(false);

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

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy address');
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
      <div className="flex items-center gap-2">
        {!authenticated && (
          <Button 
            variant="ghost" 
            onClick={login}
            className="text-gaming-text-primary hover:text-gaming-text-primary/80"
          >
            Login
          </Button>
        )}
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
              {user?.wallet && (
                <>
                  <DropdownMenuItem 
                    onClick={() => copyToClipboard(user.wallet.address)}
                    className="gap-2 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{truncateAddress(user.wallet.address)}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gaming-accent" />
                </>
              )}
              {permission !== 'granted' && (
                <DropdownMenuItem onClick={requestPermission} className="gap-2 cursor-pointer">
                  <BellRing className="w-4 h-4" />
                  <span>Enable Notifications</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={sendTestNotification} className="gap-2 cursor-pointer">
                <Bell className="w-4 h-4" />
                <span>Send Test Notification</span>
              </DropdownMenuItem>
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