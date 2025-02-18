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
          size="xs"
        />
      ) : (
        <div className="w-8 h-8 flex items-center justify-center text-gaming-text-secondary">
          <UserX className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}; 