
import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface LeadAvatarProps {
  avatarUrl: string | null;
  onAvatarChange: (file: File) => void;
}

const LeadAvatar: React.FC<LeadAvatarProps> = ({ avatarUrl, onAvatarChange }) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "The image must be less than 2MB.",
          variant: "destructive",
        });
        return;
      }
      
      onAvatarChange(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex items-center mb-6">
      <div className="relative mr-4">
        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
          {avatarPreview ? (
            <img 
              src={avatarPreview} 
              alt="Lead avatar preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-4xl">👤</span>
          )}
        </div>
        <input
          type="file"
          id="avatar"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <label 
          htmlFor="avatar" 
          className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer shadow-md"
        >
          +
        </label>
      </div>
      <div>
        <p className="text-sm mb-1">Lead Photo</p>
        <p className="text-xs text-gray-500">Max size: 2MB</p>
      </div>
    </div>
  );
};

export default LeadAvatar;
