
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

      // Add RLS policies for the bucket
      try {
        // Allow public read access to the avatars
        await supabaseAdmin.rpc('set_bucket_policy', { 
          bucket_name: 'avatars', 
          policy_name: 'Public Read Access', 
          policy_definition: 'true', 
          policy_operation: 'SELECT' 
        });

        // Allow authenticated users to upload their own avatars
        await supabaseAdmin.rpc('set_bucket_policy', { 
          bucket_name: 'avatars', 
          policy_name: 'Auth User Access', 
          policy_definition: 'auth.role() = \'authenticated\'', 
          policy_operation: 'INSERT' 
        });

        // Allow users to update/delete their own avatars
        await supabaseAdmin.rpc('set_bucket_policy', { 
          bucket_name: 'avatars', 
          policy_name: 'Auth User Update Access', 
          policy_definition: 'auth.role() = \'authenticated\'', 
          policy_operation: 'UPDATE' 
        });

        await supabaseAdmin.rpc('set_bucket_policy', { 
          bucket_name: 'avatars', 
          policy_name: 'Auth User Delete Access', 
          policy_definition: 'auth.role() = \'authenticated\'', 
          policy_operation: 'DELETE' 
        });

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Avatars bucket created with proper RLS policies' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      } catch (policyError) {
        console.error('Error setting RLS policy:', policyError);
        // Still return success if bucket was created
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Avatars bucket created but RLS policy setup failed',
          error: policyError
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 207
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Avatars bucket already exists' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error creating avatars bucket:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to create avatars bucket',
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
