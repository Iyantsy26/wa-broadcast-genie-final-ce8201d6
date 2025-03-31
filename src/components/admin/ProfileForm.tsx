
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
      
      const superAdminCheck = await hasRole('super_admin');
      setIsSuperAdmin(superAdminCheck);
    };
    
    checkSuperAdmin();
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: user?.email || "",
      phone: "",
      company: "",
      address: "",
      bio: "",
    },
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.user_metadata?.name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        company: user.user_metadata?.company || "",
        address: user.user_metadata?.address || "",
        bio: user.user_metadata?.bio || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      
      // Check for valid session before proceeding
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You need to be logged in to update your profile");
      }
      
      // Update user email if it's changed and user is super admin
      if (isSuperAdmin && data.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (emailError) throw emailError;
      }
      
      // Update other user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          phone: data.phone,
          company: data.company,
          address: data.address,
          bio: data.bio
        }
      });
      
      if (metadataError) throw metadataError;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      console.log("Updated profile data:", data);
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
