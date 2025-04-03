
import { signInWithEmail } from "@/utils/authUtils";
import { supabase } from "@/integrations/supabase/client";

// Re-export all functionality from the other modules
export { 
  hasRole,
  checkUserRole,
  isDefaultSuperAdmin,
  getDefaultSuperAdminEmail
} from './roleService';

export {
  isAuthenticated,
  signOut,
  signOutUser
} from './sessionService';

export {
  saveProfileToSupabase
} from './profileService';

export {
  createSuperAdminAccount
} from './registrationService';

// This function remains in the main authService file as it's relatively small
// and doesn't fit cleanly into the other modules
export const signIn = async (email: string, password: string) => {
  try {
    // Check if this is super admin mode for demo
    if (email === 'ssadmin@admin.com' && password === 'super-admin-password') {
      console.info("Super Admin role granted via localStorage");
      localStorage.setItem('super-admin-mode', 'true');
      localStorage.setItem('auth-token', 'super-admin-token');
      return true;
    }
    
    const { data, error } = await signInWithEmail(email, password);
    
    if (error) {
      console.error("Login error:", error.message);
      return false;
    }
    
    if (data?.user) {
      console.info("Login successful for:", data.user.email);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error in signIn:", error);
    return false;
  }
};
