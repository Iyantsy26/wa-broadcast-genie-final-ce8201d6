
import { supabase } from "@/integrations/supabase/client";
import { 
  Organization, 
  OrganizationBranding, 
  Plan
} from "../devices/deviceTypes";

/**
 * Create a new organization
 */
export const createOrganization = async (
  name: string,
  slug: string,
  ownerId?: string
): Promise<Organization | null> => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .insert({ 
        name, 
        slug,
        owner_id: ownerId,
        is_active: true
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating organization:', error);
      return null;
    }
    
    return data as Organization;
  } catch (error) {
    console.error('Error in createOrganization:', error);
    return null;
  }
};

/**
 * Update an organization
 */
export const updateOrganization = async (
  id: string,
  updates: Partial<Organization>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('organizations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating organization:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateOrganization:', error);
    return false;
  }
};

/**
 * Set a user as super admin
 */
export const setUserAsSuperAdmin = async (
  userId: string,
  isSuperAdmin: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('team_members')
      .update({ is_super_admin: isSuperAdmin })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating super admin status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in setUserAsSuperAdmin:', error);
    return false;
  }
};

/**
 * Update organization branding
 */
export const updateOrganizationBranding = async (
  organizationId: string,
  branding: Partial<OrganizationBranding>
): Promise<OrganizationBranding | null> => {
  try {
    // Check if branding exists
    const { data: existingBranding, error: checkError } = await supabase
      .from('organization_branding')
      .select('id')
      .eq('organization_id', organizationId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing branding:', checkError);
      return null;
    }
    
    let result;
    
    if (existingBranding) {
      // Update existing branding
      const { data, error } = await supabase
        .from('organization_branding')
        .update({
          ...branding,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', organizationId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating organization branding:', error);
        return null;
      }
      
      result = data;
    } else {
      // Create new branding
      const { data, error } = await supabase
        .from('organization_branding')
        .insert({
          organization_id: organizationId,
          ...branding
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating organization branding:', error);
        return null;
      }
      
      result = data;
    }
    
    return result as OrganizationBranding;
  } catch (error) {
    console.error('Error in updateOrganizationBranding:', error);
    return null;
  }
};

/**
 * Update organization plan subscription
 */
export const updateOrganizationSubscription = async (
  organizationId: string,
  planId: string,
  status: 'active' | 'trialing' | 'canceled' = 'active',
  currentPeriodEnd: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default to 30 days
): Promise<boolean> => {
  try {
    // Check if subscription exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from('organization_subscriptions')
      .select('id')
      .eq('organization_id', organizationId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing subscription:', checkError);
      return false;
    }
    
    if (existingSubscription) {
      // Update existing subscription
      const { error } = await supabase
        .from('organization_subscriptions')
        .update({
          plan_id: planId,
          status,
          current_period_end: currentPeriodEnd.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', organizationId);
      
      if (error) {
        console.error('Error updating organization subscription:', error);
        return false;
      }
    } else {
      // Create new subscription
      const { error } = await supabase
        .from('organization_subscriptions')
        .insert({
          organization_id: organizationId,
          plan_id: planId,
          status,
          current_period_start: new Date().toISOString(),
          current_period_end: currentPeriodEnd.toISOString()
        });
      
      if (error) {
        console.error('Error creating organization subscription:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateOrganizationSubscription:', error);
    return false;
  }
};

/**
 * Create a new plan
 */
export const createPlan = async (plan: Omit<Plan, 'id'>): Promise<Plan | null> => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .insert(plan)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating plan:', error);
      return null;
    }
    
    return data as Plan;
  } catch (error) {
    console.error('Error in createPlan:', error);
    return null;
  }
};

/**
 * Update a plan
 */
export const updatePlan = async (
  id: string,
  updates: Partial<Plan>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('plans')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating plan:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updatePlan:', error);
    return false;
  }
};
