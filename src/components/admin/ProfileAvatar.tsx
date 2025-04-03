
import React, { useState, useEffect } from 'react';
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

  // Check if we're in Super Admin mode
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';

  // Load avatar on component mount
  useEffect(() => {
    const fetchAvatar = async () => {
      if (user) {
        // Check if user has an avatar in metadata
        if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
          return;
        }
        
        // Check team_members table for avatar
        try {
          const { data: teamMember, error } = await supabase
            .from('team_members')
            .select('avatar')
            .eq('id', user.id)
            .maybeSingle();
            
          if (teamMember?.avatar) {
            setAvatarUrl(teamMember.avatar);
            return;
          }
        } catch (err) {
          console.error("Error loading avatar from team_members:", err);
        }
      } else if (isSuperAdmin) {
        // For super admin mode, try to retrieve from auth or team_members table
        try {
          const { data: superAdmins, error } = await supabase
            .from('team_members')
            .select('id, avatar')
            .eq('is_super_admin', true)
            .limit(1);
            
          if (superAdmins && superAdmins.length > 0 && superAdmins[0].avatar) {
            setAvatarUrl(superAdmins[0].avatar);
            return;
          }
        } catch (err) {
          console.error("Error looking up super admin avatar:", err);
        }
      }
    };
    
    fetchAvatar();
  }, [user, isSuperAdmin]);

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
      
      // Create a URL for the file to preview immediately
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
      
      // Check if the avatars bucket exists
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
        
        if (!avatarsBucketExists) {
          // Create avatars bucket if it doesn't exist
          await supabase.storage.createBucket('avatars', {
            public: true,
            fileSizeLimit: MAX_FILE_SIZE
          });
        }
      } catch (bucketError) {
        console.error("Error with bucket operation:", bucketError);
      }
      
      // Get or create user ID
      let userId: string;
      
      if (user && user.id !== 'super-admin') {
        userId = user.id;
      } else {
        // For super admin, try to find existing super admin user
        const { data: admins } = await supabase
          .from('team_members')
          .select('id')
          .eq('is_super_admin', true)
          .limit(1);
          
        if (admins && admins.length > 0) {
          userId = admins[0].id;
        } else if (isSuperAdmin) {
          // Create a placeholder ID for super admin
          userId = 'super-admin';
        } else {
          throw new Error("Unable to determine user ID for avatar upload");
        }
      }
      
      // Prepare file details
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      
      // Upload the file
      console.log("Uploading file to avatars bucket:", fileName);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
        
      if (urlData && urlData.publicUrl) {
        const publicUrl = urlData.publicUrl;
        
        // Update auth user metadata if we have a user
        if (user) {
          const { error: updateError } = await supabase.auth.updateUser({
            data: { avatar_url: publicUrl }
          });
          
          if (updateError) {
            console.error("Error updating user metadata:", updateError);
          }
        }
        
        // Always update team_members table
        if (userId !== 'super-admin') {
          const { error: teamError } = await supabase
            .from('team_members')
            .upsert({
              id: userId,
              avatar: publicUrl,
              last_active: new Date().toISOString()
            }, { onConflict: 'id' });
            
          if (teamError) {
            console.error("Error updating team_member avatar:", teamError);
          }
        }
        
        // Set the avatar URL in component state
        setAvatarUrl(publicUrl);
        
        toast({
          title: "Avatar updated",
          description: "Your avatar has been updated successfully.",
        });
      } else {
        throw new Error("Failed to get public URL for uploaded avatar");
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
