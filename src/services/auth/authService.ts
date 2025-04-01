
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
  // Check localStorage for Super Admin status first (fastest check)
  if (role === 'super_admin' && localStorage.getItem('isSuperAdmin') === 'true') {
    return true;
  }
  
  // Check if the user has the super_admin flag in their metadata
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.user_metadata?.is_super_admin === true && role === 'super_admin') {
      return true;
    }
  } catch (error) {
    console.error("Error checking user metadata for super admin:", error);
  }
  
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
      return {
        id: 'system',
        user_id: user.id,
        role: 'super_admin'
      };
    }
    
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
 * Create a super admin account in Supabase
 */
export const createSuperAdminAccount = async (email: string, password: string = "super-admin-password"): Promise<boolean> => {
  try {
    // Check if account already exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (!signInError && signInData.user) {
      console.log("Super admin account already exists");
      return true;
    }
    
    // Create new account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: "Super Admin",
          is_super_admin: true
        }
      }
    });
    
    if (error) {
      console.error("Error creating super admin account:", error);
      return false;
    }
    
    console.log("Super admin account created successfully");
    return true;
  } catch (error) {
    console.error("Error in createSuperAdminAccount:", error);
    return false;
  }
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
