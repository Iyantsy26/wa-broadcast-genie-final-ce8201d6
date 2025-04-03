
import { supabase } from "@/integrations/supabase/client";
import { getDefaultSuperAdminEmail } from "./roleService";

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
    // Clear super admin status from localStorage
    localStorage.removeItem('isSuperAdmin');
    
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      // Redirect to login page after signing out
      window.location.href = `${window.location.origin}/login`;
    }
    
    return !error;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};

/**
 * Sign out the user (using more direct path)
 */
export const signOutUser = async () => {
  try {
    // Clear super admin mode if active
    if (localStorage.getItem('super-admin-mode')) {
      localStorage.removeItem('super-admin-mode');
      localStorage.removeItem('auth-token');
      window.location.href = `${window.location.origin}/login`;
      return true;
    }
    
    return await signOut();
  } catch (error) {
    console.error("Error in signOutUser:", error);
    return false;
  }
};
