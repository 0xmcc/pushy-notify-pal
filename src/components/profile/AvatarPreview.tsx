import { User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AvatarPreviewProps {
  previewUrl: string | null;
  avatarUrl: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "w-8 h-8",
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32"
};

// Calculate icon size based on container size
const iconSizes = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48
};

const AvatarPreview = ({ 
  previewUrl, 
  avatarUrl, 
  size = "md",
  className = ""
}: AvatarPreviewProps) => {
  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {previewUrl || avatarUrl ? (
        <AvatarImage 
          src={previewUrl || avatarUrl} 
          alt="Profile" 
          className="object-cover"
        />
      ) : (
        <AvatarFallback>
          <User 
            style={{ 
              width: iconSizes[size], 
              height: iconSizes[size] 
            }} 
            className="text-gray-400"
          />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default AvatarPreview;