
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { profileFormSchema, ProfileFormValues } from "@/components/admin/ProfileFormTypes";
import { hasRole, saveProfileToSupabase } from "@/services/auth/authService";

export const useProfileForm = (user: User | null) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [originalEmail, setOriginalEmail] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<{ wasUpdated: boolean; timestamp?: number }>({ wasUpdated: false });
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      bio: "",
      customId: "",
    },
  });

  // Check if user is a super admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (user) {
        const superAdminCheck = await hasRole('super_admin');
        setIsSuperAdmin(superAdminCheck);
      } else if (localStorage.getItem('isSuperAdmin') === 'true') {
        setIsSuperAdmin(true);
      }
    };
    
    checkSuperAdmin();
  }, [user]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      console.log("Loading profile for user:", user?.id);
      if (user) {
        setOriginalEmail(user.email);
        try {
          // Handle special case for "super-admin" ID which is not a valid UUID
          if (user.id === 'super-admin') {
            console.log("Loading super-admin profile from localStorage");
            const superAdminProfile = localStorage.getItem('superAdminProfile');
            if (superAdminProfile) {
              try {
                const profileData = JSON.parse(superAdminProfile);
                form.reset({
                  name: profileData.name || "Super Admin",
                  email: profileData.email || user.email || "ssadmin@admin.com",
                  phone: profileData.phone || "",
                  company: profileData.company || "",
                  address: profileData.address || "",
                  bio: profileData.bio || "",
                  customId: profileData.customId || "SSoo3",
                });
                console.log("Loaded profile data:", profileData);
              } catch (parseError) {
                console.error("Error parsing saved profile:", parseError);
                setDefaultSuperAdminProfile();
              }
            } else {
              console.log("No saved super-admin profile found, setting default");
              setDefaultSuperAdminProfile();
            }
            return;
          }
          
          // For regular users with valid UUIDs, try to fetch from database
          console.log("Fetching team member data for:", user.id);
          const { data: teamMember, error } = await supabase
            .from('team_members')
            .select('name, email, phone, position, avatar, role, company, address, custom_id')
            .eq('id', user.id)
            .maybeSingle();
            
          if (!error && teamMember) {
            console.log("Found team member data:", teamMember);
            // Use optional chaining and nullish coalescing to safely access properties
            form.reset({
              name: teamMember?.name || user.user_metadata?.name || "",
              email: teamMember?.email || user.email || "",
              phone: teamMember?.phone || user.user_metadata?.phone || "",
              company: teamMember?.company || user.user_metadata?.company || "",
              address: teamMember?.address || user.user_metadata?.address || "",
              bio: user.user_metadata?.bio || "",
              customId: teamMember?.custom_id || "SSoo3", // Default Super Admin ID if not set
            });
            return;
          } else {
            console.log("No team member data found, error:", error);
          }
        } catch (err) {
          console.error("Error loading team member data:", err);
          // Fallback to user metadata
          form.reset({
            name: user.user_metadata?.name || "",
            email: user.email || "",
            phone: user.user_metadata?.phone || "",
            company: user.user_metadata?.company || "",
            address: user.user_metadata?.address || "",
            bio: user.user_metadata?.bio || "",
            customId: isSuperAdmin ? "SSoo3" : "", // Default for super admin
          });
        }
      } else if (localStorage.getItem('isSuperAdmin') === 'true') {
        // For super admin mode without actual user, try to load from localStorage
        console.log("Loading super-admin profile without user from localStorage");
        const savedProfile = localStorage.getItem('superAdminProfile');
        if (savedProfile) {
          try {
            const profileData = JSON.parse(savedProfile);
            setOriginalEmail(profileData.email);
            form.reset({
              name: profileData.name || "Super Admin",
              email: profileData.email || "ssadmin@admin.com",
              phone: profileData.phone || "",
              company: profileData.company || "",
              address: profileData.address || "",
              bio: profileData.bio || "",
              customId: profileData.customId || "SSoo3", // Default Super Admin ID
            });
            console.log("Loaded profile data from localStorage:", profileData);
          } catch (error) {
            console.error("Error parsing saved profile:", error);
            setDefaultSuperAdminProfile();
          }
        } else {
          console.log("No saved super-admin profile found, setting default");
          setDefaultSuperAdminProfile();
        }
      }
    };
    
    loadProfile();
  }, [user, form, isSuperAdmin]);

  // Helper function to set default super admin profile
  const setDefaultSuperAdminProfile = () => {
    form.reset({
      name: "Super Admin",
      email: "ssadmin@admin.com",
      phone: "",
      company: "",
      address: "",
      bio: "",
      customId: "SSoo3", // Default Super Admin ID
    });
  };

  // Handle form submission with improved error handling and persistence for super admin
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      console.log("Submitting profile data:", data);
      
      // Check if we're in Super Admin mode with no actual user
      const isSuperAdminMode = localStorage.getItem('isSuperAdmin') === 'true';
      
      // Always save to localStorage for Super Admin
      if (isSuperAdmin || isSuperAdminMode || (user && user.id === 'super-admin')) {
        console.log("Saving Super Admin profile to localStorage");
        localStorage.setItem('superAdminProfile', JSON.stringify(data));
      }
      
      if (user && user.id) {
        console.log("Updating profile for user:", user.id);
        
        try {
          // Skip team_members update for super-admin if it's the special "super-admin" string ID
          if (user.id !== 'super-admin') {
            // First update team_members table
            const { error: teamError } = await supabase
              .from('team_members')
              .upsert([{
                id: user.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                company: data.company,
                address: data.address,
                is_super_admin: isSuperAdmin,
                role: isSuperAdmin ? 'super_admin' : 'admin',
                status: 'active'
              }], { onConflict: 'id' });
              
            if (teamError) {
              console.error("Error updating team_members:", teamError);
              throw new Error(`Failed to update team members profile: ${teamError.message}`);
            }
            
            console.log("Updated team_members successfully");
          } else {
            console.log("Skipping team_members update for special super-admin ID");
          }
          
          // Then update user metadata - this works for all users including super-admin
          const { error: metadataError } = await supabase.auth.updateUser({
            data: {
              name: data.name,
              phone: data.phone,
              company: data.company,
              address: data.address,
              bio: data.bio,
              // Important: add these fields to ensure persistence across sessions
              is_super_admin: true,
              custom_id: data.customId
            }
          });
          
          if (metadataError) {
            console.error("Metadata update error:", metadataError);
            throw new Error(`Failed to update auth metadata: ${metadataError.message}`);
          }
          
          console.log("Updated user metadata successfully");
          
          // Handle email change separately - email changes require confirmation
          if (isSuperAdmin && data.email !== originalEmail) {
            console.log("Updating email from", originalEmail, "to", data.email);
            const { error: emailError } = await supabase.auth.updateUser({
              email: data.email,
            });
            
            if (emailError) {
              console.error("Email update error:", emailError);
              throw new Error(`Failed to update email: ${emailError.message}`);
            }
            
            toast({
              title: "Email update initiated",
              description: "A confirmation email has been sent to your new email address. Please check your inbox to confirm the change.",
            });
          }
          
          // If this is a Super Admin, also use the saveProfileToSupabase helper
          if (isSuperAdmin || user.id === 'super-admin') {
            console.log("Using saveProfileToSupabase helper for Super Admin");
            await saveProfileToSupabase(data);
          }
          
          setFormState({ 
            wasUpdated: true, 
            timestamp: Date.now() 
          });
          
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
      } else if (isSuperAdminMode) {
        // Handle profile updates in Super Admin mode without actual user
        try {
          console.log("Saving Super Admin profile to localStorage only (no user)");
          // Already saved to localStorage above
          
          setFormState({ 
            wasUpdated: true, 
            timestamp: Date.now() 
          });
          
          toast({
            title: "Profile updated",
            description: "Your super admin profile has been updated successfully.",
          });
        } catch (error: any) {
          console.error("Error saving super admin profile:", error);
          toast({
            title: "Profile Update Failed",
            description: error.message || "Could not update super admin profile.",
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
      setIsEditing(false);
    }
  };

  return {
    form,
    isSaving,
    isSuperAdmin,
    isEditing,
    setIsEditing,
    onSubmit,
    formState
  };
};
