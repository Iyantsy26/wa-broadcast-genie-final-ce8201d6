
import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCircle, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

interface ProfileAvatarProps {
  user: User | null;
}

const ProfileAvatar = ({ user }: ProfileAvatarProps) => {
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "Avatar image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setUploading(true);
      
      // Create a URL for the file to preview
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
      
      try {
        // Check if storage bucket exists
        const { data: bucketData } = await supabase.storage.getBucket('avatars');
        
        if (!bucketData) {
          // Create bucket if it doesn't exist
          await supabase.storage.createBucket('avatars', {
            public: true
          });
        }
        
        if (user) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}.${fileExt}`;
          
          // Upload the file
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, { upsert: true });
            
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
            
          if (urlData) {
            // Update user avatar URL in metadata
            const { error: updateError } = await supabase.auth.updateUser({
              data: { avatar_url: urlData.publicUrl }
            });
            
            if (updateError) throw updateError;
            
            toast({
              title: "Avatar updated",
              description: "Your avatar has been updated successfully.",
            });
          }
        } else {
          toast({
            title: "User not found",
            description: "Please log in to update your avatar.",
            variant: "destructive",
          });
        }
      } catch (storageError) {
        console.error("Storage error:", storageError);
        throw storageError;
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar className="h-24 w-24">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt="Profile" />
        ) : user?.user_metadata?.avatar_url ? (
          <AvatarImage src={user.user_metadata.avatar_url} alt="Profile" />
        ) : (
          <AvatarFallback>
            <UserCircle className="h-12 w-12" />
          </AvatarFallback>
        )}
      </Avatar>
      <div className="relative">
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
          disabled={uploading}
          onClick={() => document.getElementById('avatar-upload')?.click()}
        >
          <Upload className="h-3 w-3 mr-1" />
          {uploading ? "Uploading..." : "Change Avatar"}
        </Button>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Max size: 2MB
        </p>
      </div>
    </div>
  );
};

export default ProfileAvatar;
