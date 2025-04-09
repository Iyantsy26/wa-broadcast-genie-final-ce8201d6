
import { supabase } from "@/integrations/supabase/client";

/**
 * Get user's current plan
 */
export const getUserPlan = async (): Promise<'starter' | 'professional' | 'enterprise'> => {
  try {
    // In a real implementation, this would fetch the user's plan from the database
    // For now, we'll use a hardcoded value
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    // Check if the user has a subscription in the database
    // This is a placeholder - in a real app, you'd likely have a user_plans or subscriptions table
    const { data: planData } = await supabase
      .from('device_accounts')
      .select('plan_tier')
      .eq('id', data.user?.id)
      .maybeSingle();
      
    if (planData?.plan_tier) {
      return planData.plan_tier as 'starter' | 'professional' | 'enterprise';
    }
    
    // Default to starter plan if no plan is found
    return 'starter';
  } catch (error) {
    console.error('Error in getUserPlan:', error);
    return 'starter'; // Default to starter plan on error
  }
};

/**
 * Get account limits based on plan
 */
export const getAccountLimits = (plan: 'starter' | 'professional' | 'enterprise'): number => {
  switch (plan) {
    case 'starter':
      return 2;
    case 'professional':
      return 10;
    case 'enterprise':
      return 20;
    default:
      return 1;
  }
};
