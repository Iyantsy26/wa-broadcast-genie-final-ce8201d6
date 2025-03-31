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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { UserCircle, Upload } from "lucide-react";
import { hasRole } from "@/services/auth/authService";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileSettingsFormProps {
  user: User | null;
}

const ProfileSettingsForm = ({ user }: ProfileSettingsFormProps) => {
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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
        // If no session, try to utilize the super admin status
        if (isSuperAdmin && localStorage.getItem('isSuperAdmin') === 'true') {
          // For super admin demo, just show success toast
          toast({
            title: "Profile updated (Demo Mode)",
            description: "In demo mode, profile changes are not saved to the database, but would work in a real environment.",
          });
          setIsSaving(false);
          return;
        } else {
          throw new Error("You need to be logged in to update your profile");
        }
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "Avatar image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setUploading(true);
      
      // Create a URL for the file to preview
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
      
      // If we have Supabase storage configured and a valid session, upload the avatar
      const { data: { session } } = await supabase.auth.getSession();
      
      if (user && session) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        
        try {
          // Check if storage bucket exists
          const { data: bucketData } = await supabase.storage.getBucket('avatars');
          
          if (!bucketData) {
            // Create bucket if it doesn't exist
            await supabase.storage.createBucket('avatars', {
              public: true
            });
          }
          
          // Upload the file
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, { upsert: true });
            
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
            
          if (urlData) {
            // Update user avatar URL in metadata
            await supabase.auth.updateUser({
              data: { avatar_url: urlData.publicUrl }
            });
          }
        } catch (storageError) {
          console.error("Storage error:", storageError);
          // Continue with local preview even if storage fails
        }
      } else if (isSuperAdmin) {
        // For demo super admin, just show success toast for avatar upload
        toast({
          title: "Avatar updated (Demo Mode)",
          description: "In demo mode, avatar changes are not saved to storage, but would work in a real environment.",
        });
      }
      
      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-24 w-24">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Profile" />
            ) : user?.user_metadata?.avatar_url ? (
              <AvatarImage src={user.user_metadata.avatar_url} alt="Profile" />
            ) : (
              <AvatarFallback>
                <UserCircle className="h-12 w-12" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs"
              disabled={uploading}
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              <Upload className="h-3 w-3 mr-1" />
              {uploading ? "Uploading..." : "Change Avatar"}
            </Button>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Max size: 2MB
            </p>
          </div>
        </div>
        
        <div className="flex-1 w-full">
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
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsForm;
