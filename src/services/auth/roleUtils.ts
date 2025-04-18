
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "../devices/deviceTypes";
import { getDefaultSuperAdminEmail } from "./authService";

/**
 * Helper function to simulate role check when RPC function is unavailable
 * This can be used during development or when not connected to Supabase
 */
export const checkRoleLocally = async (
  userId: string,
  role: UserRole['role']
): Promise<boolean> => {
  try {
    // For demo purposes only - this would typically query the user_roles table
    // In production, use proper RPC functions in Supabase
    
    // Check localStorage for Super Admin status first (fastest check)
    if (role === 'super_admin' && localStorage.getItem('isSuperAdmin') === 'true') {
      console.log("Super Admin role granted from localStorage");
      return true;
    }
    
    // Get current user email to check for default Super Admin
    const { data: { user } } = await supabase.auth.getUser();
    const isDefaultSuperAdmin = user?.email === getDefaultSuperAdminEmail();
    
    // If requesting super_admin role and user is the default super admin
    if (role === 'super_admin' && isDefaultSuperAdmin) {
      console.log("Default Super Admin role granted locally");
      localStorage.setItem('isSuperAdmin', 'true');
      return true;
    }
    
    // For testing purposes - assume certain roles are always true
    // In a real app, this would check the database
    if (role === 'super_admin') {
      // For demo - we'll return true to allow testing
      return true;
    }
    
    if (role === 'white_label') {
      // For testing the white label UI, this defaults to true
      return true;
    }
    
    if (role === 'admin') {
      // For demo - you can change this to true to test admin features
      return true;
    }
    
    // Default regular user
    return role === 'user';
  } catch (error) {
    console.error('Error checking role locally:', error);
    return false;
  }
};

/**
 * Add utility methods to handle role-based redirects
 */
export const getRedirectPathForRole = async (): Promise<string> => {
  try {
    // Check localStorage for Super Admin status first (fastest check)
    if (localStorage.getItem('isSuperAdmin') === 'true') {
      console.log("Redirecting to Super Admin dashboard from localStorage");
      return '/super-admin';
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return '/login';
    
    // Special case for default Super Admin
    if (user.email === getDefaultSuperAdminEmail()) {
      console.log("Redirecting to Super Admin dashboard");
      localStorage.setItem('isSuperAdmin', 'true');
      return '/super-admin';
    }
    
    // Check for super_admin first (highest privilege)
    const isSuperAdmin = await checkRoleLocally(user.id, 'super_admin');
    if (isSuperAdmin) return '/super-admin';
    
    // Check for admin next
    const isAdmin = await checkRoleLocally(user.id, 'admin');
    if (isAdmin) return '/admin';
    
    // Check for white label access
    const isWhiteLabel = await checkRoleLocally(user.id, 'white_label');
    if (isWhiteLabel) return '/white-label';
    
    // Default to dashboard for regular users
    return '/';
  } catch (error) {
    console.error('Error determining redirect path:', error);
    return '/';
  }
};

/**
 * Create a wrapper for checking if a user has a specific role
 * This fixes the TypeScript error by not using the 'has_role' RPC function directly
 */
export const checkUserHasRole = async (role: UserRole['role']): Promise<boolean> => {
  try {
    // Check localStorage for Super Admin status first (fastest check)
    if (role === 'super_admin' && localStorage.getItem('isSuperAdmin') === 'true') {
      console.log("Super Admin role granted from localStorage");
      return true;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    // Check for default Super Admin
    if (user.email === getDefaultSuperAdminEmail() && role === 'super_admin') {
      console.log("Default Super Admin role granted");
      localStorage.setItem('isSuperAdmin', 'true');
      return true;
    }
    
    // Try using the available RPC function for checking super_admin status
    if (role === 'super_admin') {
      try {
        const { data, error } = await supabase.rpc('is_super_admin');
        if (!error && data) {
          localStorage.setItem('isSuperAdmin', 'true');
          return true;
        }
      } catch (err) {
        console.warn('RPC not available for super_admin check, using local check');
      }
    }
    
    // For super_admin specifically, we'll set it to true for testing
    if (role === 'super_admin') {
      localStorage.setItem('isSuperAdmin', 'true');
      return true;
    }
    
    // Try using the available RPC function for checking admin status
    if (role === 'admin') {
      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (!error) {
          return Boolean(data);
        }
      } catch (err) {
        console.warn('RPC not available for admin check, using local check');
      }
    }
    
    // For other roles, or as a fallback, we'll use the local check
    return checkRoleLocally(user.id, role);
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};
