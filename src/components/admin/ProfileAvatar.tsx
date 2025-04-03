
import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useAvatarFetch } from "@/hooks/useAvatarFetch";
import AvatarDisplay from "./avatar/AvatarDisplay";
import AvatarUploadButton from "./avatar/AvatarUploadButton";

interface ProfileAvatarProps {
  user: User | null;
}

const ProfileAvatar = ({ user }: ProfileAvatarProps) => {
  const { toast } = useToast();
  const { avatarUrl, setAvatarUrl } = useAvatarFetch(user);
  const { uploading, uploadAvatar, initStorageBucket } = useAvatarUpload(user);
  
  // Initialize the storage bucket using the edge function
  useEffect(() => {
    const init = async () => {
      toast({
        title: "Setting up storage",
        description: "Initializing storage for avatars...",
      });
      
      await initStorageBucket();
      
      toast({
        title: "Storage ready",
        description: "Avatar storage has been set up successfully.",
      });
    };
    
    init();
  }, [toast, initStorageBucket]);
  
  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    const newAvatarUrl = await uploadAvatar(file);
    
    if (newAvatarUrl) {
      setAvatarUrl(newAvatarUrl);
    }
  };
  
  return (
    <Card className="w-full sm:w-auto border-2 border-primary/10 shadow-md overflow-hidden">
      <CardContent className="p-6 flex flex-col items-center">
        <AvatarDisplay 
          avatarUrl={avatarUrl} 
          uploading={uploading} 
        />
        
        <AvatarUploadButton 
          uploading={uploading} 
          onUpload={handleUploadAvatar} 
        />
      </CardContent>
    </Card>
  );
};

export default ProfileAvatar;
