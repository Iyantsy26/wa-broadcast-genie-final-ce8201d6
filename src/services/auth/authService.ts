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
      
      // Ensure user has super admin flag in metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: "Super Admin",
          is_super_admin: true
        }
      });
      
      if (updateError) {
        console.error("Error updating super admin metadata:", updateError);
      }
      
      // Check if user exists in team_members table
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('id')
        .eq('email', email)
        .single();
        
      if (teamError && teamError.code !== 'PGRST116') {
        console.error("Error checking team_members:", teamError);
      }
      
      // Insert or update the team_member record
      if (!teamMember) {
        const { error: insertError } = await supabase
          .from('team_members')
          .insert([{
            id: signInData.user.id,
            name: "Super Admin",
            email: email,
            role: 'super_admin',
            is_super_admin: true,
            status: 'active'
          }]);
          
        if (insertError) {
          console.error("Error inserting team member:", insertError);
        }
      }
      
      localStorage.setItem('isSuperAdmin', 'true');
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
    
    // Add user to team_members table if needed
    if (data.user) {
      const { error: teamError } = await supabase
        .from('team_members')
        .insert([{
          id: data.user.id,
          name: "Super Admin",
          email: data.user.email,
          role: 'super_admin',
          is_super_admin: true,
          status: 'active'
        }]);
        
      if (teamError) {
        console.error("Error creating team member:", teamError);
      }
    }
    
    localStorage.setItem('isSuperAdmin', 'true');
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
    // Clear super admin status from localStorage
    localStorage.removeItem('isSuperAdmin');
    // Don't remove superAdminProfile or superAdminAvatarUrl on sign out
    // This allows the profile to persist across sessions
    
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

/**
 * Save Super Admin profile to Supabase
 */
export const saveProfileToSupabase = async (
  profileData: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    bio?: string;
    customId?: string;
  }
): Promise<boolean> => {
  try {
    console.log("Saving profile with saveProfileToSupabase:", profileData);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log("Found user:", user.id);
      
      // Update user metadata with ALL profile fields to ensure persistence
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          ...profileData,
          is_super_admin: true, // Always set this for super admin
        }
      });
      
      if (updateError) {
        console.error("Error updating user metadata:", updateError);
        return false;
      }
      
      // If this is a regular user (not the special super-admin string ID)
      if (user.id !== 'super-admin') {
        try {
          // Also update the team_members table
          const { error: teamError } = await supabase
            .from('team_members')
            .upsert([{
              id: user.id,
              name: profileData.name,
              email: profileData.email || user.email,
              phone: profileData.phone,
              company: profileData.company,
              address: profileData.address,
              role: 'super_admin',
              is_super_admin: true,
              status: 'active',
              custom_id: profileData.customId
            }], { onConflict: 'id' });
            
          if (teamError) {
            console.error("Error updating team member:", teamError);
          }
        } catch (err) {
          console.error("Error in team_members update:", err);
        }
      }
      
      // Cache in localStorage as backup - IMPORTANT for persistence across sessions
      localStorage.setItem('superAdminProfile', JSON.stringify(profileData));
      console.log("Profile saved to localStorage:", profileData);
      
      return true;
    } else {
      console.log("No user found, saving to localStorage only");
      // Fallback to localStorage if no user exists
      localStorage.setItem('superAdminProfile', JSON.stringify(profileData));
      return true;
    }
  } catch (error) {
    console.error("Error saving profile to Supabase:", error);
    
    // Fallback to localStorage
    localStorage.setItem('superAdminProfile', JSON.stringify(profileData));
    return false;
  }
};
