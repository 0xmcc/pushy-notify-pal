import { useRef } from 'react';
import { UserX } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { uploadFileToSupabase, sanitizeFilePath } from '@/utils/fileUpload';
import AvatarPreview from '../profile/AvatarPreview';

interface ProfileButtonProps {
  avatarUrl: string;
  onAvatarUpdate: (url: string) => void;
}

export const ProfileButton = ({ avatarUrl, onAvatarUpdate }: ProfileButtonProps) => {
  const { user, authenticated } = usePrivy();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div 
      onClick={handleAvatarClick} 
      className={`cursor-pointer ${authenticated ? 'hover:opacity-80' : ''}`}
    >
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