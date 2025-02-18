import { useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { uploadFileToSupabase, sanitizeFilePath } from '@/utils/fileUpload';
import AvatarPreview from '../../profile/AvatarPreview';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';

interface AvatarUploadProps {
  avatarUrl: string;
  onAvatarUpdate: (url: string) => void;
  userId?: string;
  authenticated: boolean;
}

export const AvatarUpload = ({ avatarUrl, onAvatarUpdate, userId, authenticated }: AvatarUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (userId) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    try {
      const fileExt = file.name.split('.').pop();
      const sanitizedUserId = sanitizeFilePath(userId);
      const filePath = `${sanitizedUserId}-avatar.${fileExt}`;

      const result = await uploadFileToSupabase(file, filePath);

      if ('error' in result) {
        throw result.error;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: result.publicUrl })
        .eq('did', userId);

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
    <>
      <Button variant="ghost" className="relative h-10 w-10 rounded-full" onClick={handleAvatarClick}>
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
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </>
  );
}; 