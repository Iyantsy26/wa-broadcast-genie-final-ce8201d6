
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "../devices/deviceTypes";
import { checkUserHasRole } from "./roleUtils";

// Default Super Admin credentials
const DEFAULT_SUPER_ADMIN_EMAIL = "ssadmin@admin.com";
const DEFAULT_SUPER_ADMIN_PASSWORD = "123456";

/**
 * Check if the current user has a specific role
 */
export const hasRole = async (role: UserRole['role']): Promise<boolean> => {
  return checkUserHasRole(role);
};

/**
 * Get the current user's role
 */
export const checkUserRole = async (): Promise<UserRole | null> => {
  try {
    // Check for Super Admin in localStorage first
    if (localStorage.getItem('isSuperAdmin') === 'true') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return {
          id: 'system',
          user_id: user.id,
          role: 'super_admin'
        };
      }
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // Check for roles in priority order
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
 * Check if current user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  // Check for Super Admin in localStorage first
  if (localStorage.getItem('isSuperAdmin') === 'true') {
    return true;
  }
  
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<boolean> => {
  try {
    // Clear super admin status
    localStorage.removeItem('isSuperAdmin');
    
    const { error } = await supabase.auth.signOut();
    return !error;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};

/**
 * Check if the provided credentials match the default Super Admin
 * NOTE: This is for demo purposes only and should not be used in production
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
