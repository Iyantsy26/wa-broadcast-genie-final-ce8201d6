import { supabase } from "@/integrations/supabase/client";
import { Organization, OrganizationBranding, Plan, TeamMember } from "../devices/deviceTypes";
import { Json } from "@/integrations/supabase/types";

/**
 * Add a new organization
 */
export const addOrganization = async (organization: Omit<Organization, 'id' | 'created_at' | 'updated_at'>): Promise<Organization> => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .insert([
        { 
          name: organization.name,
          slug: organization.slug,
          owner_id: organization.owner_id,
          is_active: organization.is_active
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding organization:', error);
      throw error;
    }
    
    return data as Organization;
  } catch (error) {
    console.error('Error in addOrganization:', error);
    throw error;
  }
};

/**
 * Update an existing organization
 */
export const updateOrganization = async (id: string, updates: Partial<Organization>): Promise<Organization | null> => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
    
    return data as Organization;
  } catch (error) {
    console.error('Error in updateOrganization:', error);
    throw error;
  }
};

/**
 * Delete an organization
 */
export const deleteOrganization = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting organization:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteOrganization:', error);
    return false;
  }
};

/**
 * Add branding to an organization
 */
export const addOrganizationBranding = async (branding: Omit<OrganizationBranding, 'id' | 'created_at' | 'updated_at'>): Promise<OrganizationBranding> => {
  try {
    const { data, error } = await supabase
      .from('organization_branding')
      .insert([
        { 
          organization_id: branding.organization_id,
          logo_url: branding.logo_url,
          favicon_url: branding.favicon_url,
          primary_color: branding.primary_color,
          secondary_color: branding.secondary_color,
          accent_color: branding.accent_color,
          custom_domain: branding.custom_domain,
          custom_domain_verified: branding.custom_domain_verified
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding organization branding:', error);
      throw error;
    }
    
    return data as OrganizationBranding;
  } catch (error) {
    console.error('Error in addOrganizationBranding:', error);
    throw error;
  }
};

/**
 * Update branding for an organization
 */
export const updateOrganizationBranding = async (id: string, updates: Partial<OrganizationBranding>): Promise<OrganizationBranding | null> => {
  try {
    const { data, error } = await supabase
      .from('organization_branding')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating organization branding:', error);
      throw error;
    }
    
    return data as OrganizationBranding;
  } catch (error) {
    console.error('Error in updateOrganizationBranding:', error);
    throw error;
  }
};

/**
 * Delete branding for an organization
 */
export const deleteOrganizationBranding = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('organization_branding')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting organization branding:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteOrganizationBranding:', error);
    return false;
  }
};

// Fix the addPlan function with proper type handling
export const addPlan = async (plan: Omit<Plan, "id" | "created_at" | "updated_at">): Promise<Plan> => {
  try {
    // Ensure 'name' is included in the plan object
    if (!plan.name) {
      throw new Error("Plan name is required");
    }
    
    const { data, error } = await supabase
      .from('plans')
      .insert({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        interval: plan.interval,
        features: plan.features || {},
        is_custom: plan.is_custom || false,
        is_active: plan.is_active || true,
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error adding plan:', error);
      throw error;
    }
    
    return data as Plan;
  } catch (error) {
    console.error('Error in addPlan:', error);
    throw error;
  }
};

/**
 * Update an existing plan
 */
export const updatePlan = async (id: string, updates: Partial<Plan>): Promise<Plan | null> => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
    
    return data as Plan;
  } catch (error) {
    console.error('Error in updatePlan:', error);
    throw error;
  }
};

/**
 * Delete a plan
 */
export const deletePlan = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting plan:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deletePlan:', error);
    return false;
  }
};

/**
 * Add a team member to an organization
 */
export const addTeamMember = async (teamMember: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<TeamMember> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .insert([
        {
          name: teamMember.name,
          email: teamMember.email,
          phone: teamMember.phone,
          role: teamMember.role,
          status: teamMember.status,
          company: teamMember.company,
          position: teamMember.position,
          address: teamMember.address,
          avatar: teamMember.avatar,
          department_id: teamMember.department_id,
          is_super_admin: teamMember.is_super_admin,
          custom_id: teamMember.custom_id,
          last_active: teamMember.last_active
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
    
    return data as TeamMember;
  } catch (error) {
    console.error('Error in addTeamMember:', error);
    throw error;
  }
};

/**
 * Update an existing team member
 */
export const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
    
    return data as TeamMember;
  } catch (error) {
    console.error('Error in updateTeamMember:', error);
    throw error;
  }
};

/**
 * Delete a team member
 */
export const deleteTeamMember = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting team member:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteTeamMember:', error);
    return false;
  }
};
