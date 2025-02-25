import { UserX } from 'lucide-react';
import AvatarPreview from '../../profile/AvatarPreview';

interface AvatarDisplayProps {
  avatarUrl: string;
  authenticated: boolean;
  className?: string;
}

export const AvatarDisplay = ({ avatarUrl, authenticated, className }: AvatarDisplayProps) => {
  return (
    <div className={className}>
      {authenticated ? (
        <AvatarPreview 
          previewUrl={null} 
          avatarUrl={avatarUrl}
          className="h-full w-full"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-gaming-text-secondary">
          <UserX className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}; 