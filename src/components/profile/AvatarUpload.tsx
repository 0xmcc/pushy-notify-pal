'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AvatarUploadProps {
  onComplete: (url: string) => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const AvatarUpload = ({ onComplete }: AvatarUploadProps) => {
  const { user } = usePrivy();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const sanitizeFilePath = (path: string): string => {
    return path.replace(/:/g, '-');
  };

  const uploadWithRetry = async (file: File, filePath: string, attempt: number = 1): Promise<boolean> => {
    try {
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        throw uploadError;
      }

      console.log('File uploaded successfully', { data });
      return true;
    } catch (error: any) {
      console.error(`Upload attempt ${attempt} failed:`, error);

      if (attempt < MAX_RETRIES && (error.message.includes('network') || error.message.includes('internet'))) {
        console.log(`Retrying upload in ${RETRY_DELAY/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return uploadWithRetry(file, filePath, attempt + 1);
      }
      
      throw error;
    }
  };

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
    setRetryCount(0);

    try {
      const fileExt = file.name.split('.').pop();
      const sanitizedUserId = sanitizeFilePath(user.id);
      const filePath = `${sanitizedUserId}-avatar.${fileExt}`;

      console.log('Uploading file to Supabase storage', { filePath });

      const uploadSuccess = await uploadWithRetry(file, filePath);

      if (uploadSuccess) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        console.log('Generated public URL:', publicUrl);

        setAvatarUrl(publicUrl);
        onComplete(publicUrl);
        toast.success('Avatar uploaded successfully!');
      }
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
        <Avatar className="w-24 h-24">
          {previewUrl || avatarUrl ? (
            <AvatarImage 
              src={previewUrl || avatarUrl} 
              alt="Profile" 
              className="object-cover"
            />
          ) : (
            <AvatarFallback>
              <User className="w-8 h-8 text-gray-400" />
            </AvatarFallback>
          )}
        </Avatar>
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