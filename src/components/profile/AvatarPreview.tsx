import { User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AvatarPreviewProps {
  previewUrl: string | null;
  avatarUrl: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const sizeClasses = {
  xs: "w-8 h-8",
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32"
};

const AvatarPreview = ({ previewUrl, avatarUrl, size = "md" }: AvatarPreviewProps) => {
  return (
    <Avatar className={sizeClasses[size]}>
      {previewUrl || avatarUrl ? (
        <AvatarImage 
          src={previewUrl || avatarUrl} 
          alt="Profile" 
          className="object-cover"
        />
      ) : (
        <AvatarFallback>
          <User className="w-4 h-4 text-gray-400" />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default AvatarPreview;