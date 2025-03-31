
import { PlanTier } from './deviceTypes';
import { supabase } from "@/integrations/supabase/client";

/**
 * Get the user's current plan tier
 */
export const getUserPlan = async (): Promise<PlanTier> => {
  // This would normally fetch from a user_plans table
  // For demo purposes, return 'starter' as default
  return 'starter';
};

/**
 * Get account limits based on plan tier
 */
export const getAccountLimits = (plan: PlanTier): number => {
  switch (plan) {
    case 'starter': return 2;
    case 'professional': return 10;
    case 'enterprise': return 20;
    default: return 2;
  }
};
