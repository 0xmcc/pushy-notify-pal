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

    // Create a preview URL for immediate display
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-avatar.${fileExt}`;

      console.log('Uploading file to Supabase storage', { filePath });

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully', { data });

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);

      setAvatarUrl(publicUrl);
      onComplete(publicUrl);
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Detailed error during avatar upload:', error);
      toast.error('Failed to upload avatar. Please try again.');
      // Don't clear preview on error so user can see what they selected
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