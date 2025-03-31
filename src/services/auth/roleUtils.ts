
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "../devices/deviceTypes";

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
    
    // Dummy implementation - in a real app, this would check the database
    if (role === 'white_label') {
      // For testing the white label UI, this defaults to true
      return true;
    }
    
    if (role === 'super_admin') {
      // For demo - you can change this to true to test super admin features
      return false;
    }
    
    if (role === 'admin') {
      // For demo - you can change this to true to test admin features
      return false;
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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return '/login';
    
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
 * Create a wrapper for the hasRole function to use local checks when needed
 */
export const checkUserHasRole = async (role: UserRole['role']): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    // Try using the RPC approach first
    try {
      const { data, error } = await supabase.rpc('has_role', { 
        _role: role,
        _user_id: user.id 
      });
      
      // If RPC was successful, use that result
      if (!error) {
        return Boolean(data);
      }
    } catch (err) {
      // RPC not available, fallback to local check
      console.warn('RPC not available, using local role check');
    }
    
    // Fallback to local check
    return checkRoleLocally(user.id, role);
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};
