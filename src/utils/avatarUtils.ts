
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const validateAvatarFile = (file: File, toast: ReturnType<typeof useToast>['toast']) => {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    toast({
      title: "File too large",
      description: "Avatar image must be less than 2MB",
      variant: "destructive",
    });
    return false;
  }
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    toast({
      title: "Invalid file type",
      description: "Avatar must be a JPEG, PNG, GIF, or WebP image",
      variant: "destructive",
    });
    return false;
  }
  
  return true;
};

export const uploadAvatarToStorage = async (userId: string, file: File) => {
  try {
    // Create a separate bucket path for super-admin avatars if the user is super-admin
    const bucketName = 'avatars';
    const isSuperAdmin = userId === 'super-admin';
    
    try {
      // Check if the avatars bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarsBucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!avatarsBucketExists) {
        // Create avatars bucket if it doesn't exist
        console.log("Creating avatars bucket");
        const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE
        });
        
        if (bucketError) {
          console.error("Error creating bucket:", bucketError);
          throw bucketError;
        }
      }
    } catch (bucketError) {
      console.log("Error checking/creating bucket, will attempt to use anyway:", bucketError);
    }
    
    // Prepare file details
    const fileExt = file.name.split('.').pop();
    const fileName = isSuperAdmin ? 
      `${userId}-${Date.now()}.${fileExt}` : 
      `${userId.substring(0, 8)}-${Date.now()}.${fileExt}`;
    
    // Upload the file
    console.log("Uploading file to avatars bucket:", fileName);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, { upsert: true });
      
    if (uploadError) {
      console.error("Upload error:", uploadError);
      
      // Fallback: for demo or development purposes, just store in localStorage
      if (isSuperAdmin) {
        const reader = new FileReader();
        return new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              localStorage.setItem('superAdminAvatarUrl', reader.result);
              resolve(reader.result);
            } else {
              reject(new Error("Failed to get string result from FileReader"));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        throw uploadError;
      }
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
      
    if (urlData && urlData.publicUrl) {
      // If super admin, also store in localStorage as backup
      if (isSuperAdmin) {
        localStorage.setItem('superAdminAvatarUrl', urlData.publicUrl);
      }
      return urlData.publicUrl;
    }
    
    return null;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  }
};

export const updateUserAvatar = async (userId: string, publicUrl: string) => {
  // Update auth user metadata if we have a user
  if (userId && userId !== 'super-admin') {
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });
    
    if (updateError) {
      console.error("Error updating user metadata:", updateError);
      throw updateError;
    }
  }
};

export const updateTeamMemberAvatar = async (userId: string, publicUrl: string, userData?: { name?: string; email?: string; role?: string; custom_id?: string }) => {
  // Skip team_members update for super-admin as it's a special case
  // and the UUID format causes errors
  if (userId === 'super-admin') {
    console.log("Skipping team_members update for super-admin");
    return;
  }
  
  if (userId !== 'super-admin') {
    // Get existing user data if not provided
    let name = userData?.name;
    let email = userData?.email;
    let role = userData?.role;
    let custom_id = userData?.custom_id;

    if (!name || !email || !role) {
      try {
        const { data: teamMember, error } = await supabase
          .from('team_members')
          .select('name, email, role, custom_id')
          .eq('id', userId)
          .maybeSingle();
          
        if (!error && teamMember) {
          name = teamMember.name;
          email = teamMember.email;
          role = teamMember.role;
          custom_id = teamMember.custom_id;
        } else {
          // Handle error scenario
          console.error("Error fetching team member data:", error);
          name = name || 'User';
          email = email || 'user@example.com';
          role = role || 'user';
        }
      } catch (err) {
        console.error("Error fetching team member data:", err);
        name = name || 'User';
        email = email || 'user@example.com';
        role = role || 'user';
      }
    }

    // Required fields for team_members table
    try {
      const { error: teamError } = await supabase
        .from('team_members')
        .upsert({
          id: userId,
          avatar: publicUrl,
          last_active: new Date().toISOString(),
          // Required fields that cannot be null
          name: name || 'User',
          email: email || 'user@example.com',
          role: role || 'user',
          status: 'active'
          // Don't specify custom_id here, let the trigger handle it
        }, { onConflict: 'id' });
        
      if (teamError) {
        console.error("Error updating team_member avatar:", teamError);
        throw teamError;
      }
    } catch (error) {
      console.error("Error upserting team member:", error);
      throw error;
    }
  }
};
