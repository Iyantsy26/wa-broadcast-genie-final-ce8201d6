
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers
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
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the organizations directly (bypassing RLS since we're using service role)
    const { data: organizations, error: orgError } = await supabaseClient
      .from('organizations')
      .select('*');

    if (orgError) {
      console.error("Error fetching organizations:", orgError);
      throw orgError;
    }

    // For each organization, get the member count and subscription info
    const orgsWithDetails = await Promise.all(organizations.map(async (org) => {
      // Get member count
      const { count, error: countError } = await supabaseClient
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id);

      if (countError) {
        console.error(`Error getting member count for org ${org.id}:`, countError);
      }

      // Get subscription info
      const { data: subscription, error: subError } = await supabaseClient
        .from('organization_subscriptions')
        .select('plan_id, status, current_period_end')
        .eq('organization_id', org.id)
        .maybeSingle();

      if (subError) {
        console.error(`Error getting subscription for org ${org.id}:`, subError);
      }

      // Get plan details if subscription exists
      let plan = null;
      if (subscription?.plan_id) {
        const { data: planData, error: planError } = await supabaseClient
          .from('plans')
          .select('name, price, interval, features')
          .eq('id', subscription.plan_id)
          .maybeSingle();

        if (planError) {
          console.error(`Error getting plan for org ${org.id}:`, planError);
        } else {
          plan = planData;
        }
      }

      // Get owner info if owner_id exists
      let owner = null;
      if (org.owner_id) {
        const { data: userData, error: userError } = await supabaseClient
          .from('team_members')
          .select('name, email')
          .eq('id', org.owner_id)
          .maybeSingle();

        if (userError) {
          console.error(`Error getting owner for org ${org.id}:`, userError);
        } else {
          owner = userData;
        }
      }

      return {
        ...org,
        memberCount: count || 0,
        subscription,
        plan,
        owner
      };
    }));

    // Return the data with CORS headers
    return new Response(JSON.stringify(orgsWithDetails), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Error in get-organizations function:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});
