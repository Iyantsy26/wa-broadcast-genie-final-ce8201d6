
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileAvatarProps {
  user: User | null;
}

const ProfileAvatar = ({ user }: ProfileAvatarProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const isSuperAdminMode = localStorage.getItem('isSuperAdmin') === 'true';
  
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        if (user && user.id) {
          // For special super-admin ID, try to get from localStorage
          if (user.id === 'super-admin') {
            const savedAvatar = localStorage.getItem('superAdminAvatarUrl');
            if (savedAvatar) {
              setAvatarUrl(savedAvatar);
            }
            return;
          }
          
          // Check user metadata first
          if (user.user_metadata?.avatar_url) {
            setAvatarUrl(user.user_metadata.avatar_url);
            return;
          }
          
          // Try to get from team_members table
          const { data, error } = await supabase
            .from('team_members')
            .select('avatar')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.warn("Error fetching avatar:", error);
          } else if (data && data.avatar) {
            setAvatarUrl(data.avatar);
          }
        } else if (isSuperAdminMode) {
          // Get avatar from localStorage for super admin mode
          const savedAvatar = localStorage.getItem('superAdminAvatarUrl');
          if (savedAvatar) {
            setAvatarUrl(savedAvatar);
          }
        }
      } catch (error) {
        console.error("Error in fetchAvatar:", error);
      }
    };
    
    fetchAvatar();
  }, [user, isSuperAdminMode]);
  
  // Initialize the storage bucket using the edge function
  useEffect(() => {
    const initBucket = async () => {
      try {
        toast({
          title: "Setting up storage",
          description: "Initializing storage for avatars...",
        });
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-storage-bucket`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ bucketName: 'avatars', isPublic: true })
          }
        );
        
        const result = await response.json();
        
        if (result.success) {
          console.log("Storage bucket setup:", result.message);
          toast({
            title: "Storage ready",
            description: "Avatar storage has been set up successfully.",
          });
        } else {
          console.warn("Storage setup warning:", result.error);
        }
      } catch (error) {
        console.error("Error initializing avatar storage:", error);
      }
    };
    
    initBucket();
  }, [toast]);
  
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user?.id || 'super-admin'}/${fileName}`;
      
      setUploading(true);
      
      // Upload the file to the avatars bucket
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      setAvatarUrl(publicUrl);
      
      // Update in database and user metadata
      if (user && user.id) {
        // Update user metadata
        await supabase.auth.updateUser({
          data: {
            avatar_url: publicUrl
          }
        });
        
        if (user.id !== 'super-admin') {
          // Update team_members table
          const { error: updateError } = await supabase
            .from('team_members')
            .update({ avatar: publicUrl })
            .eq('id', user.id);
          
          if (updateError) {
            console.error("Error updating avatar in database:", updateError);
          }
        }
      }
      
      // Always update in localStorage for super admin persistence
      localStorage.setItem('superAdminAvatarUrl', publicUrl);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
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
  
  return (
    <Card className="w-full sm:w-auto border-2 border-primary/10 shadow-md overflow-hidden">
      <CardContent className="p-6 flex flex-col items-center">
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
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={uploadAvatar}
            disabled={uploading}
          />
        </div>
        
        <div className="mt-4 text-center">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <Button 
              variant="outline" 
              className="mt-2"
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Change Avatar"}
            </Button>
          </label>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileAvatar;
