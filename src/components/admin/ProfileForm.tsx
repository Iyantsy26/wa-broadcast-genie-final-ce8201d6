
import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { hasRole } from "@/services/auth/authService";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  user: User | null;
}

const ProfileForm = ({ user }: ProfileFormProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (localStorage.getItem('isSuperAdmin') === 'true') {
        setIsSuperAdmin(true);
        return;
      }
      
      if (user) {
        const superAdminCheck = await hasRole('super_admin');
        setIsSuperAdmin(superAdminCheck);
      }
    };
    
    checkSuperAdmin();
  }, [user]);

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

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      console.log("Submitting profile data:", data);
      
      const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
      
      if (user && user.id) {
        console.log("Updating profile for user:", user.id);
        
        try {
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
          } else {
            console.log("Updated team_members successfully");
          }
        } catch (teamErr) {
          console.error("Exception updating team_members:", teamErr);
        }
        
        if (isSuperAdmin && data.email !== user.email) {
          console.log("Updating email from", user.email, "to", data.email);
          try {
            const { error: emailError } = await supabase.auth.updateUser({
              email: data.email,
            });
            
            if (emailError) {
              console.error("Email update error:", emailError);
              toast({
                title: "Email Update Failed",
                description: "Could not update email, but other profile data was saved.",
                variant: "destructive",
              });
            }
          } catch (emailUpdateError) {
            console.error("Failed to update email:", emailUpdateError);
          }
        }
        
        console.log("Updating user metadata");
        try {
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
            throw metadataError;
          }
          
          toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully.",
          });
          
          console.log("Successfully updated profile data:", data);
        } catch (metadataError) {
          console.error("Failed to update metadata:", metadataError);
          toast({
            title: "Profile Update Failed",
            description: "Could not update profile information in Auth metadata.",
            variant: "destructive",
          });
        }
      } else {
        if (isSuperAdmin) {
          console.log("Creating/updating super admin account");
          
          try {
            const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
              email: data.email,
              password: "super-admin-password",
            });
            
            if (signInError || !existingUser.user) {
              const { data: newUser, error: signupError } = await supabase.auth.signUp({
                email: data.email,
                password: Math.random().toString(36).substring(2, 15),
                options: {
                  data: {
                    name: data.name,
                    phone: data.phone,
                    company: data.company,
                    address: data.address,
                    bio: data.bio,
                    is_super_admin: true
                  }
                }
              });
              
              if (signupError) {
                throw signupError;
              }
              
              if (newUser?.user?.id) {
                const { error: teamError } = await supabase
                  .from('team_members')
                  .insert({
                    id: newUser.user.id,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    company: data.company,
                    address: data.address,
                    is_super_admin: true,
                    role: 'super_admin',
                    status: 'active'
                  });
                  
                if (teamError) {
                  console.error("Error creating team member:", teamError);
                }
              }
              
              toast({
                title: "Profile Created",
                description: "Super Admin profile created successfully.",
              });
              
              window.location.reload();
            } else {
              const { error: updateError } = await supabase.auth.updateUser({
                data: {
                  name: data.name,
                  phone: data.phone,
                  company: data.company,
                  address: data.address,
                  bio: data.bio,
                  is_super_admin: true
                }
              });
              
              if (updateError) {
                throw updateError;
              }
              
              const { error: teamError } = await supabase
                .from('team_members')
                .upsert({
                  id: existingUser.user.id,
                  name: data.name,
                  email: data.email,
                  phone: data.phone,
                  company: data.company,
                  address: data.address,
                  is_super_admin: true,
                  role: 'super_admin',
                  status: 'active',
                  last_active: new Date().toISOString()
                }, { onConflict: 'id' });
                
              if (teamError) {
                console.error("Error updating team member:", teamError);
              }
              
              toast({
                title: "Profile Updated",
                description: "Super Admin profile updated successfully.",
              });
            }
          } catch (authError) {
            console.error("Auth operation failed:", authError);
            toast({
              title: "Profile Update Failed",
              description: "Could not update profile in database.",
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
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="your.email@example.com" 
                  {...field} 
                  disabled={!isSuperAdmin} 
                />
              </FormControl>
              {isSuperAdmin && (
                <p className="text-xs text-muted-foreground">
                  As a Super Admin, you can edit your email address.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="Your company" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Your address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about yourself" 
                  className="resize-none min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
