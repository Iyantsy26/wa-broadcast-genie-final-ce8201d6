
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
  
  // Check if user is super admin to enable email editing
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

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      console.log("Initializing form with user data:", user);
      form.reset({
        name: user.user_metadata?.name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        company: user.user_metadata?.company || "",
        address: user.user_metadata?.address || "",
        bio: user.user_metadata?.bio || "",
      });
    } else {
      console.log("No user data available for form initialization");
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      console.log("Submitting profile data:", data);
      
      // Special case: if we're a Super Admin but no user object in supabase yet
      const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
      
      // First try to create a session if we're in super admin mode but don't have one
      if (isSuperAdmin && (!user || user.id === 'super-admin')) {
        console.log("Super Admin mode - attempting to create or use account");
        try {
          // Check if the super admin account exists
          const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: "super-admin-password", // This is just a placeholder
          });
          
          if (checkError || !existingUser.user) {
            console.log("Super admin account doesn't exist or can't be accessed, trying to create it");
            
            // Try to create the account
            const { data: newUser, error: signupError } = await supabase.auth.signUp({
              email: data.email,
              password: Math.random().toString(36).substring(2, 15), // Generate a random password
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
              console.error("Failed to create super admin account:", signupError);
              // Still save to localStorage as fallback
              localStorage.setItem('superAdminProfile', JSON.stringify(data));
              
              toast({
                title: "Profile Partially Updated",
                description: "Profile saved locally only. Could not create database account.",
              });
              setIsSaving(false);
              return;
            }
            
            console.log("Created new super admin account:", newUser);
            
            // Save locally as well
            localStorage.setItem('superAdminProfile', JSON.stringify(data));
            
            toast({
              title: "Profile Updated",
              description: "Super Admin profile created and updated successfully.",
            });
            
            window.location.reload(); // Reload to update the session
            return;
          } else {
            console.log("Successfully logged in as existing super admin:", existingUser);
            
            // Update the existing user
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
              console.error("Failed to update super admin profile:", updateError);
              // Still save to localStorage as fallback
              localStorage.setItem('superAdminProfile', JSON.stringify(data));
              
              toast({
                title: "Profile Partially Updated",
                description: "Profile saved locally only. Could not update database.",
              });
              setIsSaving(false);
              return;
            }
            
            console.log("Updated super admin profile");
            
            // Save locally as well
            localStorage.setItem('superAdminProfile', JSON.stringify(data));
            
            toast({
              title: "Profile Updated",
              description: "Super Admin profile updated successfully.",
            });
            
            // Reload to update the session
            window.location.reload();
            return;
          }
        } catch (authError) {
          console.error("Auth operation failed:", authError);
          // Fallback to localStorage
          localStorage.setItem('superAdminProfile', JSON.stringify(data));
          
          toast({
            title: "Profile Updated Locally",
            description: "Could not update database. Profile saved locally only.",
          });
          setIsSaving(false);
          return;
        }
      }
      
      // Normal user flow with authentication
      if (!user) {
        console.error("No user found when submitting form");
        toast({
          title: "Error",
          description: "You need to be logged in to update your profile.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      // Update user email if it's changed and user is super admin
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
      
      // Update other user metadata
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
        
        // Also update localStorage as a fallback/cache
        if (isSuperAdmin) {
          localStorage.setItem('superAdminProfile', JSON.stringify(data));
        }
        
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
        
        console.log("Successfully updated profile data:", data);
      } catch (metadataError) {
        console.error("Failed to update metadata:", metadataError);
        
        // Even if the Supabase update fails, we can still update the form data locally
        if (isSuperAdmin) {
          localStorage.setItem('superAdminProfile', JSON.stringify(data));
          toast({
            title: "Profile Partially Updated",
            description: "Profile saved locally for Super Admin mode.",
          });
        } else {
          toast({
            title: "Profile Update Failed",
            description: "Could not update profile information.",
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
