
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User, Building, Mail, Phone, Lock, Key, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generatePassword, generateUserId } from "@/utils/adminUtils";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  role: z.enum(["admin", "white_label", "user"]),
  sendCredentials: z.boolean().default(true),
  avatar: z
    .any()
    .refine((file) => !file || file instanceof File, "Avatar must be a file")
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "Avatar must be less than 2MB"
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddAdministratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddAdministratorDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: AddAdministratorDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      role: "admin",
      sendCredentials: true,
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      role: "admin",
      sendCredentials: true,
    });
    setAvatarPreview(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Avatar image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only .jpg, .jpeg, .png and .webp formats are supported",
        variant: "destructive",
      });
      return;
    }

    form.setValue("avatar", file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async (file: File): Promise<string | null> => {
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `admin-avatars/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload avatar image",
        variant: "destructive",
      });
      return null;
    }
  };

  const sendCredentialsEmail = async (email: string, userId: string, password: string, name: string) => {
    try {
      // In a real app, this would call an edge function to send the email
      console.log(`Sending credentials to ${email}: userId=${userId}, password=${password}`);
      
      // Mock successful email
      return true;
    } catch (error) {
      console.error('Error sending credentials email:', error);
      return false;
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Generate credentials
      const userId = generateUserId();
      const password = generatePassword();
      
      // Upload avatar if provided
      let avatarUrl = null;
      if (values.avatar instanceof File) {
        avatarUrl = await handleAvatarUpload(values.avatar);
      }
      
      // Create a new user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: password,
        options: {
          data: {
            name: values.name,
            role: values.role,
          }
        }
      });
      
      if (authError) throw authError;
      
      // Get the user ID from the auth response
      const userId = authData.user?.id;
      
      if (!userId) {
        throw new Error("Failed to create user account");
      }
      
      // Create a record in the team_members table
      const { error: insertError } = await supabase
        .from('team_members')
        .insert({
          id: userId,
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          company: values.company || null,
          position: values.position || null,
          role: values.role,
          avatar: avatarUrl,
          status: 'pending',
          is_super_admin: false,
        });
        
      if (insertError) throw insertError;
      
      // Send credentials email if requested
      let emailSent = false;
      if (values.sendCredentials) {
        emailSent = await sendCredentialsEmail(
          values.email, 
          userId, 
          password,
          values.name
        );
      }
      
      toast({
        title: "Administrator Added",
        description: `${values.name} has been added as ${values.role}${emailSent ? ' and credentials have been sent' : ''}`,
      });
      
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error adding administrator:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add administrator",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open && !isSubmitting) {
        resetForm();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Administrator</DialogTitle>
          <DialogDescription>
            Create a new administrator account with appropriate permissions
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[500px] overflow-y-auto">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="h-20 w-20 cursor-pointer">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Admin avatar" />
                  ) : (
                    <AvatarFallback>
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  )}
                  <div
                    className="absolute -bottom-2 -right-2 rounded-full bg-primary p-1 text-white shadow-sm cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </div>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  Max size: 2MB
                </p>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input {...field} className="pl-8" placeholder="John Doe" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input {...field} className="pl-8" placeholder="Acme Inc" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Marketing Manager" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input {...field} type="email" className="pl-8" placeholder="john.doe@example.com" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input {...field} className="pl-8" placeholder="+1 (555) 123-4567" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <div className="relative">
                    <ShieldCheck className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="admin">Administrator</option>
                        <option value="white_label">White Label</option>
                        <option value="user">User</option>
                      </select>
                    </FormControl>
                  </div>
                  <FormDescription>
                    {field.value === 'admin' 
                      ? 'Full access to manage system features and settings' 
                      : field.value === 'white_label' 
                      ? 'Limited admin access with custom branding capabilities' 
                      : 'Basic access with limited permissions'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sendCredentials"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Send Credentials</FormLabel>
                    <FormDescription>
                      Send login details to the administrator via email
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <p className="text-xs text-muted-foreground border-l-2 border-muted-foreground/20 pl-2">
              A User ID will be automatically generated and a secure password will be created. 
              {form.watch("sendCredentials") 
                ? " These credentials will be sent to the administrator via email." 
                : " You'll need to provide these credentials to the administrator manually."}
            </p>
            
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Administrator"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAdministratorDialog;
