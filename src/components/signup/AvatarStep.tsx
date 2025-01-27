import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AvatarPreview from '../profile/AvatarPreview';
import { uploadFileToSupabase, sanitizeFilePath } from '@/utils/fileUpload';

interface AvatarStepProps {
  onNext: (avatarUrl: string) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const AvatarStep = ({ onNext, onBack, isSubmitting }: AvatarStepProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `avatars/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const result = await uploadFileToSupabase(selectedFile, filePath);
      if ('publicUrl' in result) {
        onNext(result.publicUrl);
      }
    } else {
      // Proceed without avatar
      onNext('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <label 
          htmlFor="avatar-upload" 
          className="cursor-pointer inline-block group relative"
        >
          <div className="relative">
            <AvatarPreview 
              previewUrl={previewUrl} 
              avatarUrl={null}
              size="lg"
              iconSize={48}
              className="border-2 border-gaming-accent hover:border-gaming-primary transition-colors duration-200"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-sm text-white">
                {previewUrl ? 'Change Avatar' : 'Upload Avatar'}
              </span>
            </div>
          </div>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="avatar-upload"
        />
        <p className="mt-4 text-sm text-gaming-text-secondary">
          Click avatar to {previewUrl ? 'change' : 'upload'} image
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          onClick={onBack}
          variant="link"
          className="flex-1 text-gaming-text-primary hover:text-gaming-text-primary/80"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-gaming-primary to-gaming-secondary hover:opacity-90"
        >
          {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
        </Button>
      </div>
    </form>
  );
}; 