
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
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucketExists) {
      // Create the bucket
      const { error: bucketError } = await supabase.storage.createBucket('avatars', {
        public: true, // Make the bucket public
        fileSizeLimit: 2 * 1024 * 1024, // 2MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });
      
      if (bucketError) {
        console.error("Error creating bucket:", bucketError);
        throw bucketError;
      }
      
      // Add public SELECT policy for avatars (allows public access)
      const { error: policyError } = await supabase.rpc('create_storage_policy', {
        bucket_name: 'avatars',
        policy_name: 'Public Read Access',
        definition: 'true', // Anyone can read
        operation: 'SELECT'
      }).single();
      
      if (policyError && !policyError.message.includes("already exists")) {
        console.error("Error setting public read policy:", policyError);
      }
      
      // Add INSERT policy to allow authenticated users to upload their own avatars
      const { error: insertPolicyError } = await supabase.rpc('create_storage_policy', {
        bucket_name: 'avatars',
        policy_name: 'Authenticated Insert Access',
        definition: 'auth.role() = \'authenticated\'', // Any authenticated user can upload
        operation: 'INSERT'
      }).single();
      
      if (insertPolicyError && !insertPolicyError.message.includes("already exists")) {
        console.error("Error setting insert policy:", insertPolicyError);
      }
      
      // Add UPDATE/DELETE policy for own files
      const { error: updatePolicyError } = await supabase.rpc('create_storage_policy', {
        bucket_name: 'avatars',
        policy_name: 'Authenticated Update Own Files',
        definition: 'auth.role() = \'authenticated\'',
        operation: 'UPDATE'
      }).single();
      
      if (updatePolicyError && !updatePolicyError.message.includes("already exists")) {
        console.error("Error setting update policy:", updatePolicyError);
      }
    }
  } catch (bucketError) {
    console.error("Error checking/creating bucket:", bucketError);
    throw bucketError;
  }
};

export const uploadAvatarToStorage = async (userId: string, file: File): Promise<string> => {
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
    throw uploadError;
  }
  
  // Get the public URL of the uploaded file
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
    
  if (!urlData || !urlData.publicUrl) {
    throw new Error("Failed to get public URL for uploaded avatar");
  }
  
  return urlData.publicUrl;
};

export const updateUserAvatarInDatabase = async (userId: string, avatarUrl: string): Promise<void> => {
  // Update auth user metadata
  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl }
  });
  
  if (updateError) {
    console.error("Error updating user metadata:", updateError);
    throw updateError;
  }
  
  // Update team_members table
  const { error: teamError } = await supabase
    .from('team_members')
    .update({ avatar: avatarUrl })
    .eq('id', userId);
    
  if (teamError) {
    console.error("Error updating team_member avatar:", teamError);
    throw teamError;
  }
};
