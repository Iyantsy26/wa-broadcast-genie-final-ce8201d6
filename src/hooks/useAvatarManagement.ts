
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAvatarManagement = (user: User | null) => {
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
      }
    };
    
    fetchAvatar();
  }, [user]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      
      // Validate file size
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Avatar image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Avatar must be a JPEG, PNG, GIF, or WebP image",
          variant: "destructive",
        });
        return;
      }
      
      setUploading(true);
      
      // Get user ID
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }
      
      const userId = user.id;
      
      try {
        // Create avatars bucket if it doesn't exist
        try {
          // First, check if the bucket exists
          const { data: buckets } = await supabase.storage.listBuckets();
          const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
          
          if (!avatarsBucketExists) {
            // Create the bucket
            const { error: bucketError } = await supabase.storage.createBucket('avatars', {
              public: true,
              fileSizeLimit: 2 * 1024 * 1024, // 2MB
              allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            });
            
            if (bucketError) {
              console.error("Error creating bucket:", bucketError);
              throw bucketError;
            }
          }
        } catch (bucketError) {
          console.error("Error checking/creating bucket:", bucketError);
          throw bucketError;
        }
        
        // Prepare file details for upload
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true });
          
        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }
        
        // Get the public URL of the uploaded file
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        if (!urlData || !urlData.publicUrl) {
          throw new Error("Failed to get public URL for uploaded avatar");
        }
        
        const publicUrl = urlData.publicUrl;
        
        // Update user metadata and team_members table
        if (user && user.id) {
          // Update auth user metadata
          const { error: updateError } = await supabase.auth.updateUser({
            data: { avatar_url: publicUrl }
          });
          
          if (updateError) {
            console.error("Error updating user metadata:", updateError);
          }
          
          // Update team_members table
          try {
            const { error: teamError } = await supabase
              .from('team_members')
              .update({ avatar: publicUrl })
              .eq('id', userId);
              
            if (teamError) {
              console.error("Error updating team_member avatar:", teamError);
            }
          } catch (err) {
            console.error("Error updating team_member:", err);
          }
        }
        
        // Update the UI with the new avatar
        setAvatarUrl(publicUrl);
        
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully.",
        });
      } catch (error: any) {
        console.error("Error handling avatar upload:", error);
        toast({
          title: "Upload failed",
          description: error.message || "Failed to upload avatar. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return {
    avatarUrl,
    uploading,
    handleAvatarUpload
  };
};
