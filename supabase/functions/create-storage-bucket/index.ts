
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a more robust storage bucket initialization function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body to get bucket name and options
    const requestData = await req.json();
    const { bucketName = "avatars", isPublic = true } = requestData;
    
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Create storage bucket if it doesn't exist
    const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }
    
    const bucketExists = existingBuckets.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: isPublic,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
      });
      
      if (createError) {
        console.error("Error creating bucket:", createError);
        throw new Error(`Failed to create bucket: ${createError.message}`);
      }
      
      console.log(`Successfully created bucket: ${bucketName}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Created storage bucket: ${bucketName}` 
        }),
        { 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Bucket ${bucketName} already exists` 
        }),
        { 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unknown error occurred"
      }),
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
});
