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

  useEffect(() => {
    const loadProfile = async () => {
      console.log("Loading profile for user:", user?.id);
      if (user) {
        setOriginalEmail(user.email);
        try {
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
          
          console.log("Fetching team member data for:", user.id);
          const { data: teamMember, error } = await supabase
            .from('team_members')
            .select('name, email, phone, position, avatar, role, company, address, custom_id')
            .eq('id', user.id)
            .maybeSingle();
            
          if (!error && teamMember) {
            console.log("Found team member data:", teamMember);
            form.reset({
              name: teamMember?.name || user.user_metadata?.name || "",
              email: teamMember?.email || user.email || "",
              phone: teamMember?.phone || user.user_metadata?.phone || "",
              company: teamMember?.company || user.user_metadata?.company || "",
              address: teamMember?.address || user.user_metadata?.address || "",
              bio: user.user_metadata?.bio || "",
              customId: teamMember?.custom_id || "SSoo3",
            });
            return;
          } else {
            console.log("No team member data found, error:", error);
          }
        } catch (err) {
          console.error("Error loading team member data:", err);
          form.reset({
            name: user.user_metadata?.name || "",
            email: user.email || "",
            phone: user.user_metadata?.phone || "",
            company: user.user_metadata?.company || "",
            address: user.user_metadata?.address || "",
            bio: user.user_metadata?.bio || "",
            customId: isSuperAdmin ? "SSoo3" : "",
          });
        }
      } else if (localStorage.getItem('isSuperAdmin') === 'true') {
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
              customId: profileData.customId || "SSoo3",
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

  const setDefaultSuperAdminProfile = () => {
    form.reset({
      name: "Super Admin",
      email: "ssadmin@admin.com",
      phone: "",
      company: "",
      address: "",
      bio: "",
      customId: "SSoo3",
    });
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      console.log("Submitting profile data:", data);
      
      const isSuperAdminMode = localStorage.getItem('isSuperAdmin') === 'true';
      
      if (isSuperAdmin || isSuperAdminMode || (user && user.id === 'super-admin')) {
        console.log("Saving Super Admin profile to localStorage");
        localStorage.setItem('superAdminProfile', JSON.stringify(data));
      }
      
      if (user && user.id) {
        console.log("Updating profile for user:", user.id);
        
        try {
          if (user.id !== 'super-admin') {
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
          
          try {
            const { error: metadataError } = await supabase.auth.updateUser({
              data: {
                name: data.name,
                phone: data.phone,
                company: data.company,
                address: data.address,
                bio: data.bio,
                is_super_admin: true,
                custom_id: data.customId
              }
            });
            
            if (metadataError) {
              console.error("Metadata update error:", metadataError);
              throw new Error(`Failed to update auth metadata: ${metadataError.message}`);
            }
            
            console.log("Updated user metadata successfully");
          } catch (metadataError) {
            console.error("Error updating user metadata:", metadataError);
          }
          
          if (isSuperAdmin && data.email !== originalEmail) {
            console.log("Updating email from", originalEmail, "to", data.email);
            try {
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
            } catch (emailError) {
              console.error("Error updating email:", emailError);
            }
          }
          
          if (isSuperAdmin || user.id === 'super-admin') {
            console.log("Using saveProfileToSupabase helper for Super Admin");
            await saveProfileToSupabase({
              name: data.name,
              email: data.email,
              phone: data.phone,
              company: data.company,
              address: data.address,
              bio: data.bio,
              customId: data.customId
            });
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
        console.log("Saving Super Admin profile to localStorage only (no user)");
        setFormState({ 
          wasUpdated: true, 
          timestamp: Date.now() 
        });
        
        toast({
          title: "Profile updated",
          description: "Your super admin profile has been updated successfully.",
        });
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
