
import { supabase } from "@/integrations/supabase/client";

/**
 * Get user's current plan
 */
export const getUserPlan = async (): Promise<'starter' | 'professional' | 'enterprise'> => {
  try {
    // Try to get the user's current plan from Supabase if authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user?.id) {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          id,
          organization_subscriptions (
            plan_id,
            plans (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user plan:', error);
      }
      
      if (data?.organization_subscriptions?.[0]?.plans?.name) {
        const planName = data.organization_subscriptions[0].plans.name.toLowerCase();
        
        if (planName.includes('professional')) {
          return 'professional';
        } else if (planName.includes('enterprise')) {
          return 'enterprise';
        }
      }
    }
  } catch (error) {
    console.error('Error in getUserPlan:', error);
  }
  
  // Default to starter if not authenticated or no plan found
  return 'starter';
};

/**
 * Get account limits based on plan
 */
export const getAccountLimits = (plan: 'starter' | 'professional' | 'enterprise'): number => {
  switch (plan) {
    case 'professional':
      return 10;
    case 'enterprise':
      return 20;
    case 'starter':
    default:
      return 2;
  }
};

/**
 * Upgrade a user's plan
 */
export const upgradePlan = async (
  targetPlan: 'starter' | 'professional' | 'enterprise'
): Promise<boolean> => {
  try {
    // In a real app this would integrate with a payment provider
    // For now, we'll simulate an upgrade by directly updating the plan tier
    
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      console.error('No authenticated user found');
      return false;
    }
    
    // Get the user's organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', session.user.id)
      .maybeSingle();
    
    if (orgError || !orgData) {
      console.error('Error fetching organization:', orgError);
      return false;
    }
    
    // Get the plan ID for the target plan
    const { data: planData, error: planError } = await supabase
      .from('plans')
      .select('id')
      .ilike('name', `%${targetPlan}%`)
      .maybeSingle();
    
    if (planError || !planData) {
      console.error('Error fetching plan:', planError);
      return false;
    }
    
    // Update the organization's subscription
    const { data: subData, error: subError } = await supabase
      .from('organization_subscriptions')
      .update({
        plan_id: planData.id,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .eq('organization_id', orgData.id);
    
    if (subError) {
      console.error('Error updating subscription:', subError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in upgradePlan:', error);
    return false;
  }
};
