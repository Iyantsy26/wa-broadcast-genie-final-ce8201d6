
import { supabase } from "@/integrations/supabase/client";

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
