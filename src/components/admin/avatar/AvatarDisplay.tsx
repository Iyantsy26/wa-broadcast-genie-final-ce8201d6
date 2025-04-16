
import React from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useAvatarHandling } from '@/hooks/useAvatarHandling';

interface AvatarDisplayProps {
  avatarUrl: string | null;
  uploading?: boolean;
  className?: string;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ 
  avatarUrl, 
  uploading = false,
  className
}) => {
  const { isValidAvatarUrl, handleAvatarError } = useAvatarHandling();

  return (
    <div className="relative my-2">
      <Avatar className={cn("h-24 w-24 mx-auto", className)}>
        {isValidAvatarUrl(avatarUrl) && (
          <AvatarImage 
            src={avatarUrl!} 
            alt="Profile avatar" 
            className="object-cover"
            onError={(e) => handleAvatarError(e, "Profile")}
          />
        )}
        <AvatarFallback className="bg-primary/10 text-primary text-4xl">
          <User strokeWidth={1.5} />
        </AvatarFallback>
      </Avatar>
      
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
};

export default AvatarDisplay;
