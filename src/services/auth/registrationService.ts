
import { supabase } from "@/integrations/supabase/client";
import { signInWithEmail } from "@/utils/authUtils";

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
