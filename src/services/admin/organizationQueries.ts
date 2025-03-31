
import { supabase } from "@/integrations/supabase/client";
import { 
  Organization, 
  OrganizationBranding, 
  Plan, 
  OrganizationSubscription 
} from "../devices/deviceTypes";

/**
 * Check if the current user is a super admin
 */
export const checkIsSuperAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_super_admin');
    
    if (error) {
      console.error('Error checking super admin status:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in checkIsSuperAdmin:', error);
    return false;
  }
};

/**
 * Get all organizations
 */
export const getOrganizations = async (): Promise<Organization[]> => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }
    
    return data as Organization[];
  } catch (error) {
    console.error('Error in getOrganizations:', error);
    return [];
  }
};

/**
 * Get organization by ID
 */
export const getOrganizationById = async (id: string): Promise<Organization | null> => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching organization:', error);
      return null;
    }
    
    return data as Organization;
  } catch (error) {
    console.error('Error in getOrganizationById:', error);
    return null;
  }
};

/**
 * Get organization branding
 */
export const getOrganizationBranding = async (
  organizationId: string
): Promise<OrganizationBranding | null> => {
  try {
    const { data, error } = await supabase
      .from('organization_branding')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching organization branding:', error);
      return null;
    }
    
    return data as OrganizationBranding;
  } catch (error) {
    console.error('Error in getOrganizationBranding:', error);
    return null;
  }
};

/**
 * Get all plans
 */
export const getPlans = async (): Promise<Plan[]> => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price');
    
    if (error) {
      console.error('Error fetching plans:', error);
      return [];
    }
    
    return data as Plan[];
  } catch (error) {
    console.error('Error in getPlans:', error);
    return [];
  }
};

/**
 * Get organization subscription with plan
 */
export const getOrganizationSubscription = async (
  organizationId: string
): Promise<OrganizationSubscription | null> => {
  try {
    const { data, error } = await supabase
      .from('organization_subscriptions')
      .select(`
        *,
        plan:plans(*)
      `)
      .eq('organization_id', organizationId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching organization subscription:', error);
      return null;
    }
    
    return data as OrganizationSubscription;
  } catch (error) {
    console.error('Error in getOrganizationSubscription:', error);
    return null;
  }
};

/**
 * Get organization limits
 */
export const getOrganizationLimits = async (
  organizationId: string
): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc(
      'get_organization_limits', 
      { org_id: organizationId }
    );
    
    if (error) {
      console.error('Error fetching organization limits:', error);
      return {};
    }
    
    return data || {};
  } catch (error) {
    console.error('Error in getOrganizationLimits:', error);
    return {};
  }
};
