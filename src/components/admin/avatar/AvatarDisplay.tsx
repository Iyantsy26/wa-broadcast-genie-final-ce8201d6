
import React from 'react';
import { Camera, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarDisplayProps {
  avatarUrl: string | null;
  uploading: boolean;
}

const AvatarDisplay = ({ avatarUrl, uploading }: AvatarDisplayProps) => {
  return (
    <div className="relative group">
      <Avatar className="h-32 w-32 border-2 border-primary/20">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt="Profile picture" />
        ) : (
          <AvatarFallback className="bg-primary/5">
            <UserCircle className="h-20 w-20 text-primary/40" />
          </AvatarFallback>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
          <label htmlFor="avatar-upload" className="flex items-center justify-center w-full h-full cursor-pointer">
            <Camera className="h-8 w-8 text-white" />
          </label>
        </div>
      </Avatar>
    </div>
  );
};

export default AvatarDisplay;
