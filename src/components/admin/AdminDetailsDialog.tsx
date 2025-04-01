
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
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Pencil, Upload, Mail, Building, Phone, User, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const adminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  role: z.string(),
  status: z.string(),
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

type AdminFormValues = z.infer<typeof adminSchema>;

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
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [adminData, setAdminData] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      role: "admin",
      status: "active",
    },
  });

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

  useEffect(() => {
    const loadAdminData = async () => {
      if (!adminId || !open) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("team_members")
          .select("*")
          .eq("id", adminId)
          .single();

        if (error) throw error;
        
        setAdminData(data);
        setAvatarPreview(data.avatar || null);
        
        form.reset({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          company: data.company || "",
          position: data.position || "",
          role: data.role || "admin",
          status: data.status || "active",
        });
      } catch (error) {
        console.error("Error loading admin data:", error);
        toast({
          title: "Error",
          description: "Failed to load administrator details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [adminId, open, toast, form]);

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

  const onSubmit = async (values: AdminFormValues) => {
    if (!adminId) return;
    
    setIsLoading(true);
    try {
      let avatarUrl = adminData?.avatar || null;
      
      // Upload new avatar if provided
      if (values.avatar instanceof File) {
        avatarUrl = await handleAvatarUpload(values.avatar);
      }
      
      const { error } = await supabase
        .from("team_members")
        .update({
          name: values.name,
          email: values.email,
          phone: values.phone,
          company: values.company,
          position: values.position,
          role: values.role,
          status: values.status,
          avatar: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", adminId);

      if (error) throw error;

      toast({
        title: "Admin Updated",
        description: "Administrator details have been updated successfully",
      });
      
      setIsEditing(false);
      onSave();
    } catch (error) {
      console.error("Error updating admin:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update administrator details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Administrator Details</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edit administrator details" : "View administrator details"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : adminData ? (
          <>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="py-4">
                {isEditing ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <Avatar className="h-20 w-20 cursor-pointer">
                            {avatarPreview ? (
                              <AvatarImage src={avatarPreview} alt="Admin avatar" />
                            ) : (
                              <AvatarFallback>
                                <UserCircle className="h-10 w-10" />
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
                      
                      <div className="flex space-x-4">
                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Role</FormLabel>
                              <FormControl>
                                <select
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  {...field}
                                >
                                  <option value="admin">Admin</option>
                                  <option value="white_label">White Label</option>
                                  <option value="user">User</option>
                                  {adminData.is_super_admin && <option value="super_admin">Super Admin</option>}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Status</FormLabel>
                              <FormControl>
                                <select
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  {...field}
                                >
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                  <option value="pending">Pending</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <DialogFooter className="mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                      <Avatar className="h-20 w-20">
                        {adminData.avatar ? (
                          <AvatarImage src={adminData.avatar} alt={adminData.name} />
                        ) : (
                          <AvatarFallback>
                            <UserCircle className="h-10 w-10" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{adminData.name}</h3>
                        <p className="text-sm text-muted-foreground">{adminData.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {adminData.role === 'super_admin' ? 'Super Admin' : 
                             adminData.role === 'admin' ? 'Admin' : 
                             adminData.role === 'white_label' ? 'White Label' : 'User'}
                          </Badge>
                          <Badge variant="outline" className={`
                            ${adminData.status === 'active' ? 'bg-green-100 text-green-800' : 
                              adminData.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                              'bg-amber-100 text-amber-800'}
                          `}>
                            {adminData.status === 'active' ? 'Active' : 
                             adminData.status === 'inactive' ? 'Inactive' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">Company</Label>
                      <p className="text-sm">{adminData.company || "—"}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">Position</Label>
                      <p className="text-sm">{adminData.position || "—"}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">Phone</Label>
                      <p className="text-sm">{adminData.phone || "—"}</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="account" className="py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                      Account Permissions
                    </h3>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      <p>
                        <span className="font-medium">Role:</span> {adminData.role === 'super_admin' ? 'Super Admin' : 
                          adminData.role === 'admin' ? 'Admin' : 
                          adminData.role === 'white_label' ? 'White Label' : 'User'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {adminData.role === 'super_admin' ? 'Full access to all system features and settings' : 
                         adminData.role === 'admin' ? 'Administrative access to manage most system settings' : 
                         adminData.role === 'white_label' ? 'Customized branded access with limited admin privileges' : 
                         'Basic user access with limited privileges'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">Account Details</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Status</div>
                      <div>
                        {adminData.status === 'active' ? 'Active' : 
                         adminData.status === 'inactive' ? 'Inactive' : 'Pending'}
                      </div>
                      
                      <div className="text-muted-foreground">Last Active</div>
                      <div>
                        {adminData.last_active ? new Date(adminData.last_active).toLocaleDateString() : "—"}
                      </div>
                      
                      <div className="text-muted-foreground">Created</div>
                      <div>
                        {adminData.created_at ? new Date(adminData.created_at).toLocaleDateString() : "—"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">Actions</h3>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" disabled>
                        Reset Password
                      </Button>
                      <Button variant="outline" size="sm" disabled className={adminData.status === 'active' ? 'text-red-500 hover:text-red-500' : ''}>
                        {adminData.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            {!isEditing && (
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Close
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogFooter>
            )}
          </>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            Administrator not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminDetailsDialog;
