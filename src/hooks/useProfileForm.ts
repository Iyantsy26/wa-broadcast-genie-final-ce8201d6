
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { profileFormSchema, ProfileFormValues } from "@/components/admin/ProfileFormTypes";
import { hasRole } from "@/services/auth/authService";

export const useProfileForm = (user: User | null) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      bio: "",
    },
  });

  // Check if user is a super admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (user) {
        const superAdminCheck = await hasRole('super_admin');
        setIsSuperAdmin(superAdminCheck);
      }
    };
    
    checkSuperAdmin();
  }, [user]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const { data: teamMember, error } = await supabase
            .from('team_members')
            .select('name, email, phone, position, avatar, role, company, address')
            .eq('id', user.id)
            .maybeSingle();
            
          if (!error && teamMember) {
            // Use optional chaining and nullish coalescing to safely access properties
            form.reset({
              name: teamMember?.name || user.user_metadata?.name || "",
              email: teamMember?.email || user.email || "",
              phone: teamMember?.phone || user.user_metadata?.phone || "",
              company: teamMember?.company || user.user_metadata?.company || "",
              address: teamMember?.address || user.user_metadata?.address || "",
              bio: user.user_metadata?.bio || "",
            });
            return;
          }
        } catch (err) {
          console.error("Error loading team member data:", err);
        }
        
        // Fallback to user metadata if team member data isn't available
        form.reset({
          name: user.user_metadata?.name || "",
          email: user.email || "",
          phone: user.user_metadata?.phone || "",
          company: user.user_metadata?.company || "",
          address: user.user_metadata?.address || "",
          bio: user.user_metadata?.bio || "",
        });
      }
    };
    
    loadProfile();
  }, [user, form]);

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      console.log("Submitting profile data:", data);
      
      if (user && user.id) {
        console.log("Updating profile for user:", user.id);
        
        try {
          // First update team_members table
          const { error: teamError } = await supabase
            .from('team_members')
            .upsert({
              id: user.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              company: data.company,
              address: data.address,
              is_super_admin: isSuperAdmin,
              role: isSuperAdmin ? 'super_admin' : 'admin',
              status: 'active',
              last_active: new Date().toISOString()
            }, { onConflict: 'id' });
            
          if (teamError) {
            console.error("Error updating team_members:", teamError);
            throw new Error(`Failed to update team members profile: ${teamError.message}`);
          }
          
          console.log("Updated team_members successfully");
          
          // Then update user metadata
          const { error: metadataError } = await supabase.auth.updateUser({
            data: {
              name: data.name,
              phone: data.phone,
              company: data.company,
              address: data.address,
              bio: data.bio
            }
          });
          
          if (metadataError) {
            console.error("Metadata update error:", metadataError);
            throw new Error(`Failed to update auth metadata: ${metadataError.message}`);
          }
          
          if (isSuperAdmin && data.email !== user.email) {
            console.log("Updating email from", user.email, "to", data.email);
            const { error: emailError } = await supabase.auth.updateUser({
              email: data.email,
            });
            
            if (emailError) {
              console.error("Email update error:", emailError);
              throw new Error(`Failed to update email: ${emailError.message}`);
            }
          }
          
          toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully.",
          });
          
          console.log("Successfully updated profile data:", data);
        } catch (error: any) {
          console.error("Error in profile update operations:", error);
          toast({
            title: "Profile Update Failed",
            description: error.message || "Could not update profile information.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "You need to be logged in to update your profile.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    form,
    isSaving,
    isSuperAdmin,
    onSubmit
  };
};
