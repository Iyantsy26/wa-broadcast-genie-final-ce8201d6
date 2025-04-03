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
    // Check if the avatars bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucketExists) {
      // Create avatars bucket if it doesn't exist
      console.log("Creating avatars bucket");
      await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE
      });
    }
    
    // Prepare file details
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
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
