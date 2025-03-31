
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "../devices/deviceTypes";

/**
 * Check if the current user has a specific role
 */
export const hasRole = async (role: UserRole['role']): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', role)
      .single();
    
    if (error || !data) return false;
    
    return true;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

/**
 * Get the current user's role
 */
export const checkUserRole = async (): Promise<UserRole | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // First check if user is a super admin
    const { data: superAdminData, error: superAdminError } = await supabase
      .rpc('is_super_admin');
      
    if (!superAdminError && superAdminData) {
      return {
        id: 'system',
        user_id: user.id,
        role: 'super_admin'
      };
    }
    
    // Check other roles
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .order('role', { ascending: false }) // Get highest priority role first
      .limit(1)
      .single();
    
    if (error || !data) {
      // Default to regular user
      return {
        id: 'default',
        user_id: user.id,
        role: 'user'
      };
    }
    
    return data as UserRole;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

/**
 * Check if current user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();
    return !error;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};
