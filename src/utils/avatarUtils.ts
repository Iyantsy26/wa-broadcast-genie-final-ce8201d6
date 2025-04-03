
import { supabase } from "@/integrations/supabase/client";

export const validateAvatarFile = (file: File): { valid: boolean; error?: string } => {
  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    return { 
      valid: false,
      error: "Avatar image must be less than 2MB"
    };
  }
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false,
      error: "Avatar must be a JPEG, PNG, GIF, or WebP image"
    };
  }
  
  return { valid: true };
};

export const createAvatarsBucket = async (): Promise<void> => {
  try {
    // Call the edge function to ensure the bucket exists with proper permissions
    const { error } = await supabase.functions.invoke('create-avatars-bucket');
    
    if (error) {
      console.error("Error creating avatars bucket:", error);
      throw error;
    }
  } catch (bucketError) {
    console.error("Error checking/creating bucket:", bucketError);
    throw bucketError;
  }
};

export const uploadAvatarToStorage = async (userId: string, file: File): Promise<string> => {
  try {
    // First ensure bucket exists with proper policies
    await createAvatarsBucket();
    
    // Prepare file details
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });
      
    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    // Get the public URL of the uploaded file
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
      
    if (!urlData || !urlData.publicUrl) {
      throw new Error("Failed to get public URL for uploaded avatar");
    }
    
    console.log("Successfully uploaded avatar to:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadAvatarToStorage:", error);
    throw error;
  }
};

export const updateUserAvatarInDatabase = async (userId: string, avatarUrl: string): Promise<void> => {
  try {
    // Update auth user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl }
    });
    
    if (updateError) {
      console.error("Error updating user metadata:", updateError);
      throw updateError;
    }
    
    // Update team_members table if user exists there
    const { error: teamError } = await supabase
      .from('team_members')
      .update({ avatar: avatarUrl })
      .eq('id', userId);
      
    if (teamError) {
      // Only throw if it's not a "no rows updated" error
      if (!teamError.message.includes("no rows")) {
        console.error("Error updating team_member avatar:", teamError);
        throw teamError;
      } else {
        console.log("No team_member record found for avatar update - this is normal for some users");
      }
    }
  } catch (error) {
    console.error("Error in updateUserAvatarInDatabase:", error);
    throw error;
  }
};
