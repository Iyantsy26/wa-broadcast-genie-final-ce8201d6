
import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useAvatarManagement } from "@/hooks/useAvatarManagement";
import AvatarDisplay from "./avatar/AvatarDisplay";
import AvatarUploadButton from "./avatar/AvatarUploadButton";

interface ProfileAvatarProps {
  user: User | null;
}

const ProfileAvatar = ({ user }: ProfileAvatarProps) => {
  const { toast } = useToast();
  const { avatarUrl, uploading, handleAvatarUpload } = useAvatarManagement(user);
  
  useEffect(() => {
    // Notify user that the component is ready for use
    toast({
      title: "Avatar component ready",
      description: "You can now upload or change your profile picture.",
    });
  }, [toast]);
  
  return (
    <Card className="w-full sm:w-auto border-2 border-primary/10 shadow-md overflow-hidden">
      <CardContent className="p-6 flex flex-col items-center">
        <AvatarDisplay 
          avatarUrl={avatarUrl} 
          uploading={uploading} 
        />
        
        <AvatarUploadButton 
          uploading={uploading} 
          onUpload={handleAvatarUpload} 
        />
      </CardContent>
    </Card>
  );
};

export default ProfileAvatar;
