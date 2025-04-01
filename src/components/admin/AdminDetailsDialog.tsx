
import React, { useState, useEffect } from "react";
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
import { UserCircle, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const adminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.string(),
  status: z.string(),
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
  const [adminData, setAdminData] = useState<any>(null);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "admin",
      status: "active",
    },
  });

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
        form.reset({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
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

  const onSubmit = async (values: AdminFormValues) => {
    if (!adminId) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("team_members")
        .update({
          name: values.name,
          email: values.email,
          phone: values.phone,
          role: values.role,
          status: values.status,
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
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-16 w-16">
                {adminData.avatar ? (
                  <AvatarImage src={adminData.avatar} alt={adminData.name} />
                ) : (
                  <AvatarFallback>
                    <UserCircle className="h-10 w-10" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="font-medium text-lg">{adminData.name}</h3>
                <p className="text-sm text-muted-foreground">{adminData.email}</p>
                <div className="mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    adminData.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {adminData.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 ml-2">
                    {adminData.role === 'super_admin' ? 'Super Admin' : 
                     adminData.role === 'admin' ? 'Admin' : 
                     adminData.role === 'white_label' ? 'White Label' : 'User'}
                  </span>
                </div>
              </div>
            </div>

            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} type="email" />
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
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Email</div>
                    <div>{adminData.email}</div>
                    
                    <div className="text-muted-foreground">Phone</div>
                    <div>{adminData.phone || "—"}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Account Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Role</div>
                    <div>
                      {adminData.role === 'super_admin' ? 'Super Admin' : 
                       adminData.role === 'admin' ? 'Admin' : 
                       adminData.role === 'white_label' ? 'White Label' : 'User'}
                    </div>
                    
                    <div className="text-muted-foreground">Status</div>
                    <div>
                      {adminData.status === 'active' ? 'Active' : 
                       adminData.status === 'inactive' ? 'Inactive' : 
                       adminData.status === 'pending' ? 'Pending' : '—'}
                    </div>
                    
                    <div className="text-muted-foreground">Last Active</div>
                    <div>
                      {adminData.last_active ? new Date(adminData.last_active).toLocaleDateString() : "—"}
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="mt-6">
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
              </div>
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
