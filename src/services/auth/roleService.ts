
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "../devices/deviceTypes";
import { checkUserHasRole } from "./roleUtils";
import { DEFAULT_SUPER_ADMIN_EMAIL } from "./authConstants";

/**
 * Check if the current user has a specific role
 */
export const hasRole = async (role: UserRole['role']): Promise<boolean> => {
  // Check localStorage for Super Admin status first (fastest check)
  if (role === 'super_admin' && localStorage.getItem('isSuperAdmin') === 'true') {
    return true;
  }
  
  try {
    // Check if the user has the super_admin flag in their metadata
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.user_metadata?.is_super_admin === true && role === 'super_admin') {
      // Store flag in localStorage for faster subsequent checks
      localStorage.setItem('isSuperAdmin', 'true');
      return true;
    }

    // Check for roles in Supabase database
    if (user) {
      const { data, error } = await supabase
        .from('team_members')
        .select('role, is_super_admin')
        .eq('id', user.id)
        .single();
        
      if (data) {
        if (role === 'super_admin' && data.is_super_admin) {
          localStorage.setItem('isSuperAdmin', 'true');
          return true;
        }
        
        if (data.role === role) {
          return true;
        }
      }
    }
  } catch (error) {
    console.error("Error checking user metadata for role:", error);
  }
  
  // Fallback to roleUtils check
  return checkUserHasRole(role);
};

/**
 * Get the current user's role
 */
export const checkUserRole = async (): Promise<UserRole | null> => {
  try {
    // Check for Super Admin in localStorage first
    if (localStorage.getItem('isSuperAdmin') === 'true') {
      return {
        id: 'system',
        user_id: 'super-admin',
        role: 'super_admin'
      };
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // Check if user has super_admin flag in metadata
    if (user.user_metadata?.is_super_admin === true) {
      localStorage.setItem('isSuperAdmin', 'true');
      return {
        id: 'system',
        user_id: user.id,
        role: 'super_admin'
      };
    }
    
    // Check for roles in Supabase database
    const { data, error } = await supabase
      .from('team_members')
      .select('role, is_super_admin')
      .eq('id', user.id)
      .single();
      
    if (data) {
      if (data.is_super_admin) {
        localStorage.setItem('isSuperAdmin', 'true');
        return {
          id: 'system',
          user_id: user.id,
          role: 'super_admin'
        };
      }
      
      if (data.role) {
        return {
          id: data.role,
          user_id: user.id,
          role: data.role as UserRole['role']
        };
      }
    }
    
    // Fallback to the old checks
    const isSuperAdmin = await checkUserHasRole('super_admin');
    if (isSuperAdmin) {
      return {
        id: 'system',
        user_id: user.id,
        role: 'super_admin'
      };
    }
    
    const isAdmin = await checkUserHasRole('admin');
    if (isAdmin) {
      return {
        id: 'admin',
        user_id: user.id,
        role: 'admin'
      };
    }
    
    const isWhiteLabel = await checkUserHasRole('white_label');
    if (isWhiteLabel) {
      return {
        id: 'white_label',
        user_id: user.id,
        role: 'white_label'
      };
    }
    
    // Default to regular user
    return {
      id: 'default',
      user_id: user.id,
      role: 'user'
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

/**
 * Check if the provided credentials match the default Super Admin
 */
export const isDefaultSuperAdmin = (email: string, password: string): boolean => {
  return email === DEFAULT_SUPER_ADMIN_EMAIL && password === DEFAULT_SUPER_ADMIN_PASSWORD;
};

/**
 * Get the default Super Admin email
 */
export const getDefaultSuperAdminEmail = (): string => {
  return DEFAULT_SUPER_ADMIN_EMAIL;
};
