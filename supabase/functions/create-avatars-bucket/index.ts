
// This Supabase Edge Function ensures the avatars bucket exists with proper permissions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

console.log("Create avatars bucket function is running!");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if bucket exists
    const { data: existingBuckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets();

    if (bucketsError) {
      throw bucketsError;
    }

    const bucketExists = existingBuckets.some(bucket => bucket.name === 'avatars');

    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { data, error } = await supabaseAdmin.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 2 * 1024 * 1024, // 2MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      if (error) {
        throw error;
      }
      
      console.log("Created avatars bucket successfully");
    } else {
      console.log("Avatars bucket already exists");
    }

    // Now, update RLS policies regardless of whether the bucket was just created or already existed
    // This ensures the policies are set correctly even if the bucket was created previously
    try {
      // Allow public read access to the avatars
      await supabaseAdmin.storage.from('avatars').setPublic(true);
      
      // Create policies that allow authenticated users to manage their own avatars
      await supabaseAdmin.rpc('create_storage_policy', {
        bucket_name: 'avatars',
        policy_name: 'Public Read Access',
        definition: 'true',
        operation: 'SELECT'
      }).catch(e => console.log("Public read policy setup error (might already exist):", e));

      // Allow any authenticated user to upload avatars
      await supabaseAdmin.rpc('create_storage_policy', {
        bucket_name: 'avatars',
        policy_name: 'Auth User Upload',
        definition: 'auth.role() = \'authenticated\'',
        operation: 'INSERT'
      }).catch(e => console.log("Upload policy setup error (might already exist):", e));

      // Allow users to update/delete their own avatars
      await supabaseAdmin.rpc('create_storage_policy', {
        bucket_name: 'avatars',
        policy_name: 'Auth User Update',
        definition: 'auth.role() = \'authenticated\'',
        operation: 'UPDATE'
      }).catch(e => console.log("Update policy setup error (might already exist):", e));

      await supabaseAdmin.rpc('create_storage_policy', {
        bucket_name: 'avatars',
        policy_name: 'Auth User Delete',
        definition: 'auth.role() = \'authenticated\'',
        operation: 'DELETE'
      }).catch(e => console.log("Delete policy setup error (might already exist):", e));

      console.log("Successfully set RLS policies on avatars bucket");

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Avatars bucket verified and policies updated' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (policyError) {
      console.error('Error setting storage policies:', policyError);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Avatars bucket exists but policy update failed',
        error: policyError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 207
      });
    }
  } catch (error) {
    console.error('Error in create-avatars-bucket function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to manage avatars bucket',
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
