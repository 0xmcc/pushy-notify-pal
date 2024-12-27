import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AvatarPreview from './AvatarPreview';
import { uploadFileToSupabase, sanitizeFilePath } from '@/utils/fileUpload';

interface AvatarUploadProps {
  onComplete: (url: string) => void;
}

const AvatarUpload = ({ onComplete }: AvatarUploadProps) => {
  const { user } = usePrivy();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      console.log('No file selected or user not authenticated');
      return;
    }

    console.log('Starting file upload process', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: user.id
    });

    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const sanitizedUserId = sanitizeFilePath(user.id);
      const filePath = `${sanitizedUserId}-avatar.${fileExt}`;

      console.log('Uploading file to Supabase storage', { filePath });

      const result = await uploadFileToSupabase(file, filePath);

      if ('error' in result) {
        throw result.error;
      }

      setAvatarUrl(result.publicUrl);
      toast.success('Avatar uploaded successfully!');
      // Automatically move to the next step by calling onComplete
      onComplete(result.publicUrl);
    } catch (error) {
      console.error('Detailed error during avatar upload:', error);
      toast.error('Failed to upload avatar. Please check your internet connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="text-center space-y-4">
      <h2 className="text-xl font-semibold">Add a Profile Picture</h2>
      <p className="text-gray-600">Choose an avatar that represents you</p>
      <div className="flex flex-col items-center space-y-4">
        <AvatarPreview 
          previewUrl={previewUrl} 
          avatarUrl={avatarUrl}
        />
        <Button
          variant="outline"
          className="relative"
          onClick={() => document.getElementById('avatar-upload')?.click()}
          disabled={isUploading}
        >
          <input
            id="avatar-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleAvatarUpload}
          />
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
      </div>
    </div>
  );
};

export default AvatarUpload;