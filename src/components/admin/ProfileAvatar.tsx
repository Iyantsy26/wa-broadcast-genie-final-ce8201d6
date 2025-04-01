
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

  // Check if we're in Super Admin mode
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';

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
      
      // Check if we're in Super Admin mode without a real authenticated user
      const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
      
      // Try to store avatar in Supabase first, regardless of the mode
      try {
        // Check if we can get the current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        // If we have a valid Supabase user
        if (currentUser && currentUser.id) {
          console.log("Storing avatar for authenticated user:", currentUser.id);
          const userId = currentUser.id;
          
          // Ensure the avatars bucket exists
          try {
            const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('avatars');
            
            if (bucketError || !bucketData) {
              console.log("Creating avatars bucket");
              // Create bucket if it doesn't exist
              await supabase.storage.createBucket('avatars', {
                public: true
              });
            }
          } catch (bucketError) {
            console.error("Error with bucket operation:", bucketError);
          }
          
          // Prepare file details
          const fileExt = file.name.split('.').pop();
          const fileName = `${userId}.${fileExt}`;
          
          // Upload the file
          console.log("Uploading file to avatars bucket:", fileName);
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, { upsert: true });
            
          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw uploadError;
          }
          
          // Get public URL
          console.log("Getting public URL for uploaded file");
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
            
          if (urlData) {
            const publicUrl = urlData.publicUrl;
            
            // Update user avatar URL in metadata
            console.log("Updating user metadata with avatar URL:", publicUrl);
            const { error: updateError } = await supabase.auth.updateUser({
              data: { avatar_url: publicUrl }
            });
            
            if (updateError) {
              console.error("Update metadata error:", updateError);
              throw updateError;
            }
            
            // Only use localStorage as a fallback
            if (isSuperAdmin) {
              localStorage.setItem('superAdminAvatarUrl', publicUrl);
            }
            
            toast({
              title: "Avatar updated",
              description: "Your avatar has been updated successfully.",
            });
            
            setUploading(false);
            return;
          }
        } else if (isSuperAdmin) {
          // For Super Admin mode, try to authenticate if possible
          console.log("Super Admin mode - trying to create account in Supabase");
          
          try {
            // Get the Super Admin email from localStorage or fallback
            const email = localStorage.getItem('superAdminEmail') || 'ssadmin@admin.com';
            
            // Try to sign up or sign in as Super Admin
            const { data, error } = await supabase.auth.signUp({
              email,
              password: "123456", // Simple password for demo
              options: {
                data: {
                  is_super_admin: true,
                  avatar_url: null // We'll update this after upload
                }
              }
            });
            
            if (error) {
              // If signup fails, try signing in
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password: "123456"
              });
              
              if (signInError) {
                console.error("Both signup and signin failed:", signInError);
                throw signInError;
              }
              
              // Successfully signed in
              const userId = signInData.user?.id;
              
              if (userId) {
                // Now upload the avatar with the user ID
                const fileExt = file.name.split('.').pop();
                const fileName = `${userId}.${fileExt}`;
                
                // Upload to Supabase storage
                const { error: uploadError } = await supabase.storage
                  .from('avatars')
                  .upload(fileName, file, { upsert: true });
                  
                if (uploadError) throw uploadError;
                
                const { data: urlData } = supabase.storage
                  .from('avatars')
                  .getPublicUrl(fileName);
                  
                if (urlData) {
                  // Update user metadata with avatar URL
                  const { error: updateError } = await supabase.auth.updateUser({
                    data: { avatar_url: urlData.publicUrl }
                  });
                  
                  if (updateError) throw updateError;
                  
                  toast({
                    title: "Avatar updated",
                    description: "Your avatar has been stored in Supabase.",
                  });
                  setUploading(false);
                  return;
                }
              }
            } else {
              // Successfully signed up
              console.log("Created Super Admin account in Supabase");
            }
          } catch (authError) {
            console.error("Authentication error:", authError);
          }
          
          // Fallback to localStorage
          console.log("Falling back to localStorage for avatar storage");
          
          // Convert file to data URL for localStorage
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            localStorage.setItem('superAdminAvatarUrl', base64data);
            
            toast({
              title: "Avatar Updated",
              description: "Avatar saved locally and to Supabase if possible.",
            });
            setUploading(false);
          };
          reader.readAsDataURL(file);
          return;
        }
      } catch (storageError) {
        console.error("Supabase storage error:", storageError);
        
        // Fallback to localStorage if Supabase storage fails
        if (isSuperAdmin) {
          console.log("Falling back to localStorage for avatar storage");
          
          // Convert file to data URL for localStorage
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            localStorage.setItem('superAdminAvatarUrl', base64data);
            
            toast({
              title: "Avatar Partially Updated",
              description: "Avatar saved locally only. Database update failed.",
            });
            setUploading(false);
          };
          reader.readAsDataURL(file);
          return;
        } else {
          toast({
            title: "Upload failed",
            description: "Failed to upload avatar to Supabase. Please try again.",
            variant: "destructive",
          });
        }
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

  // Try to get avatar from Supabase first, then fallback to localStorage
  React.useEffect(() => {
    const checkAvatar = async () => {
      if (!avatarUrl) {
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          
          if (currentUser?.user_metadata?.avatar_url) {
            setAvatarUrl(currentUser.user_metadata.avatar_url);
          } else if (isSuperAdmin) {
            // Fallback to localStorage
            const savedAvatar = localStorage.getItem('superAdminAvatarUrl');
            if (savedAvatar) {
              setAvatarUrl(savedAvatar);
            }
          }
        } catch (error) {
          console.error("Error checking user avatar:", error);
          
          // Fallback to localStorage if Supabase check fails
          if (isSuperAdmin) {
            const savedAvatar = localStorage.getItem('superAdminAvatarUrl');
            if (savedAvatar) {
              setAvatarUrl(savedAvatar);
            }
          }
        }
      }
    };
    
    checkAvatar();
  }, [avatarUrl, isSuperAdmin]);

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
