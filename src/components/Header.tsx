import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AvatarPreview from './profile/AvatarPreview';
import { uploadFileToSupabase, sanitizeFilePath } from '@/utils/fileUpload';
import { toast } from 'sonner';

export const Header = () => {
  const { user } = usePrivy();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      setAvatarUrl(result.publicUrl);
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 py-1 z-50">
      <div className="max-w-4xl mx-auto flex justify-end items-center px-4">
        <div 
          onClick={handleAvatarClick} 
          className={`cursor-pointer ${user ? 'hover:opacity-80' : ''}`}
        >
          <AvatarPreview 
            previewUrl={null} 
            avatarUrl={avatarUrl}
            size="sm"
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </header>
  );
};