
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);
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
      
      // Check if we're in Super Admin mode without a real authenticated user
      const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
      
      // For Super Admin mode or any other special case without authentication
      if (isSuperAdmin && (!user || user.id === 'super-admin')) {
        console.log("Super Admin mode detected - setting local avatar preview");
        // Create a URL for the file to preview
        const objectUrl = URL.createObjectURL(file);
        setAvatarUrl(objectUrl);
        
        // Save to localStorage for persistence
        try {
          // Convert file to data URL for localStorage
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result;
            localStorage.setItem('superAdminAvatarUrl', base64data as string);
          };
          reader.readAsDataURL(file);
        } catch (storageError) {
          console.error("Error saving avatar to localStorage:", storageError);
        }
        
        toast({
          title: "Avatar updated",
          description: "Your avatar has been updated for Super Admin mode.",
        });
        
        setUploading(false);
        return;
      }
      
      // Normal user flow with authentication
      if (!user) {
        console.error("No user found when uploading avatar");
        toast({
          title: "Error",
          description: "You need to be logged in to update your avatar.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }
      
      console.log("Starting avatar upload for user:", user.id);
      
      // Create a URL for the file to preview
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
      
      try {
        // Use existing Supabase code for authenticated users
        // Prepare file details
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        
        console.log("Checking if avatars bucket exists");
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('avatars');
        
        if (bucketError) {
          console.log("Error checking bucket:", bucketError);
          // If bucket doesn't exist and we can't create it, we'll just use local preview
          toast({
            title: "Avatar Preview Only",
            description: "Storage unavailable. Avatar updated in preview mode only.",
          });
          setUploading(false);
          return;
        }
        
        if (!bucketData) {
          console.log("Creating avatars bucket");
          // Create bucket if it doesn't exist
          const { error: createError } = await supabase.storage.createBucket('avatars', {
            public: true
          });
          
          if (createError) {
            console.error("Error creating bucket:", createError);
            toast({
              title: "Avatar Preview Only",
              description: "Storage unavailable. Avatar updated in preview mode only.",
            });
            setUploading(false);
            return;
          }
        }
        
        // Upload the file
        console.log("Uploading file to avatars bucket:", fileName);
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true });
          
        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast({
            title: "Upload Issue",
            description: "File preview available, but couldn't save to storage.",
          });
          setUploading(false);
          return;
        }
        
        // Get public URL
        console.log("Getting public URL for uploaded file");
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        if (urlData) {
          // Update user avatar URL in metadata
          console.log("Updating user metadata with avatar URL:", urlData.publicUrl);
          const { error: updateError } = await supabase.auth.updateUser({
            data: { avatar_url: urlData.publicUrl }
          });
          
          if (updateError) {
            console.error("Update metadata error:", updateError);
            toast({
              title: "Profile Partially Updated",
              description: "Avatar is visible but we couldn't save it to your profile.",
            });
            setUploading(false);
            return;
          }
          
          toast({
            title: "Avatar updated",
            description: "Your avatar has been updated successfully.",
          });
        }
      } catch (storageError) {
        console.error("Storage error:", storageError);
        toast({
          title: "Avatar Preview Only",
          description: "Your avatar is updated in the interface but not saved.",
        });
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

  // Use super admin fallback for avatar if no user or avatarUrl
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
  
  // Try to get avatar from localStorage for Super Admin mode
  React.useEffect(() => {
    if (isSuperAdmin && (!avatarUrl || avatarUrl === null)) {
      const savedAvatar = localStorage.getItem('superAdminAvatarUrl');
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
      }
    }
  }, [isSuperAdmin, avatarUrl]);

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar className="h-24 w-24">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt="Profile" />
        ) : user?.user_metadata?.avatar_url ? (
          <AvatarImage src={user.user_metadata.avatar_url} alt="Profile" />
        ) : (
          <AvatarFallback className={isSuperAdmin ? "bg-primary/10" : ""}>
            <UserCircle className={`h-12 w-12 ${isSuperAdmin ? "text-primary" : ""}`} />
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
