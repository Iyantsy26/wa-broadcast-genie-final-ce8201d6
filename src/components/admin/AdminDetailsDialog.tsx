import React, { useState, useEffect, useRef } from "react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Upload, User, Building, Mail, Phone, Briefcase, Calendar, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TeamMember } from "@/utils/adminUtils";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const adminFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  role: z.string(),
  customId: z.string().optional(),
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

type AdminFormValues = z.infer<typeof adminFormSchema>;

interface AdminDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  adminId: string | null;
  onSave: () => void;
}

const AdminDetailsDialog = ({
  open,
  onClose,
  adminId,
  onSave,
}: AdminDetailsDialogProps) => {
  const { toast } = useToast();
  const [admin, setAdmin] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      role: "admin",
      customId: "",
    },
  });

  useEffect(() => {
    if (open && adminId) {
      fetchAdminDetails(adminId);
    } else {
      setAdmin(null);
      setIsLoading(false);
      setIsEditing(false);
    }
  }, [open, adminId]);

  const fetchAdminDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setAdmin(data as TeamMember);
        resetForm(data as TeamMember);
      }
    } catch (error) {
      console.error('Error fetching admin details:', error);
      toast({
        title: "Error",
        description: "Failed to load administrator details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = (data: TeamMember) => {
    form.reset({
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      company: data.company || "",
      position: data.position || "",
      role: data.role,
      customId: data.custom_id || "",
    });
    
    setAvatarPreview(data.avatar || null);
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

  const onSubmit = async (values: AdminFormValues) => {
    if (!admin) return;
    setIsSubmitting(true);
    
    try {
      // Upload avatar if provided
      let avatarUrl = admin.avatar;
      if (values.avatar instanceof File) {
        const newAvatarUrl = await handleAvatarUpload(values.avatar);
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl;
        }
      }
      
      // Update the record in the team_members table
      const { error: updateError } = await supabase
        .from('team_members')
        .update({
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          company: values.company || null,
          position: values.position || null,
          role: values.role,
          avatar: avatarUrl,
          updated_at: new Date().toISOString(),
          // Never update custom_id here as it's system-managed
        })
        .eq('id', admin.id);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Administrator Updated",
        description: `${values.name}'s profile has been updated successfully`,
      });
      
      setIsEditing(false);
      onSave();
      fetchAdminDetails(admin.id);
    } catch (error: any) {
      console.error('Error updating administrator:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update administrator",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white border-0">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-400 text-white border-0">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-amber-400 text-white border-0">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Administrator Details</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edit administrator information" : "View administrator information"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : admin ? (
          <>
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20 cursor-pointer">
                        {avatarPreview ? (
                          <AvatarImage src={avatarPreview} alt="Admin avatar" />
                        ) : (
                          <AvatarFallback>
                            {admin.name.split(' ').map(n => n[0]).join('')}
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
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="customId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User ID</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              {...field}
                              className="pl-8 bg-muted"
                              readOnly
                              disabled
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          System-assigned ID that cannot be changed
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input {...field} className="pl-8" />
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
                              <Input {...field} className="pl-8" />
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
                            <Input {...field} />
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
                            <Input {...field} type="email" className="pl-8" />
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input {...field} className="pl-8" />
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
                          <Shield className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                              disabled={admin.is_super_admin}
                            >
                              <option value="admin">Administrator</option>
                              <option value="white_label">White Label</option>
                              <option value="user">User</option>
                              {admin.is_super_admin && <option value="super_admin">Super Admin</option>}
                            </select>
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            ) : (
              <div className="space-y-4 py-4">
                <div className="flex justify-center mb-6">
                  <Avatar className="h-24 w-24">
                    {admin.avatar ? (
                      <AvatarImage src={admin.avatar} alt={admin.name} />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {admin.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{admin.name}</h3>
                    {getStatusBadge(admin.status)}
                  </div>
                  
                  <div className="text-sm flex items-center gap-2 font-mono bg-muted p-2 rounded">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>ID: {admin.custom_id || 'Not assigned'}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{admin.email}</span>
                    </div>
                    
                    {admin.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{admin.phone}</span>
                      </div>
                    )}
                    
                    {admin.company && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{admin.company}</span>
                      </div>
                    )}
                    
                    {admin.position && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{admin.position}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">
                        {admin.is_super_admin ? 'Super Admin' : admin.role}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {formatDate(admin.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="w-full"
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No administrator selected
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminDetailsDialog;
