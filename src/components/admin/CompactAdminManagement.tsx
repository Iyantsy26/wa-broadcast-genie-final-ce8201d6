
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  MoreHorizontal,
  Plus,
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  Pencil,
  Trash2,
  Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminDetailsDialog from './AdminDetailsDialog';

const CompactAdminManagement = () => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setAdmins(data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: 'Error',
        description: 'Failed to load administrators',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAdmins();
  }, []);
  
  const filteredAdmins = admins.filter(admin => {
    const searchLower = searchTerm.toLowerCase();
    return (
      admin.name?.toLowerCase().includes(searchLower) ||
      admin.email?.toLowerCase().includes(searchLower) ||
      admin.role?.toLowerCase().includes(searchLower)
    );
  });
  
  const handleAddAdmin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const role = formData.get('role') as string;
    
    if (!name || !email || !role) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Create a random password (user would reset it later)
      const password = Math.random().toString(36).slice(-8);
      
      // Create user in Supabase auth
      const { data: userData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            is_super_admin: role === 'super_admin',
          }
        }
      });
      
      if (authError) throw authError;
      
      // Add to team_members table
      const { error: insertError } = await supabase
        .from('team_members')
        .insert([{
          id: userData.user?.id,
          name,
          email,
          phone,
          role,
          is_super_admin: role === 'super_admin',
          status: 'active',
        }]);
        
      if (insertError) throw insertError;
      
      toast({
        title: 'Administrator Added',
        description: 'The new administrator has been added successfully',
      });
      
      setAddDialogOpen(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to add administrator',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this administrator?')) {
      return;
    }
    
    try {
      // Remove from team_members table
      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('id', adminId);
        
      if (deleteError) throw deleteError;
      
      // Attempt to delete from auth (this may fail if the user doesn't exist in auth)
      try {
        // Note: This requires admin access which is not available in client-side code
        // In a real app, you would use an edge function for this
        console.log("Would delete user from auth (server-side operation)");
      } catch (authError) {
        console.error('Auth deletion error (expected):', authError);
      }
      
      toast({
        title: 'Administrator Deleted',
        description: 'The administrator has been removed',
      });
      
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete administrator',
        variant: 'destructive',
      });
    }
  };
  
  const handleViewAdmin = (adminId: string) => {
    setSelectedAdminId(adminId);
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Administrators</CardTitle>
            <CardDescription>
              Manage your organization's administrators
            </CardDescription>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Administrator
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Administrator</DialogTitle>
                <DialogDescription>
                  Create a new administrator account
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+1 (555) 123-4567"
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    name="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue="admin"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="white_label">White Label</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                
                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Administrator</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search administrators..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading administrators...</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-2 text-sm text-muted-foreground">No administrators found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewAdmin(admin.id)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {admin.is_super_admin && (
                            <Shield className="h-4 w-4 text-amber-500 mr-2" />
                          )}
                          {admin.name}
                        </div>
                        <div className="text-sm text-muted-foreground">{admin.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(admin.role)}>
                          {formatRole(admin.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(admin.status)}>
                          {formatStatus(admin.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleViewAdmin(admin.id);
                            }}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAdmin(admin.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AdminDetailsDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        adminId={selectedAdminId}
        onSave={fetchAdmins}
      />
    </div>
  );
};

// Helper components
const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium leading-none">
    {children}
  </label>
);

const Badge = ({ 
  children, 
  variant = "default" 
}: { 
  children: React.ReactNode; 
  variant?: "default" | "outline" | "admin" | "white_label" | "super_admin" | "active" | "inactive" | "pending"; 
}) => {
  const variantClasses = {
    default: "bg-primary/10 text-primary",
    outline: "border border-input bg-background",
    admin: "bg-blue-100 text-blue-800",
    white_label: "bg-purple-100 text-purple-800",
    super_admin: "bg-amber-100 text-amber-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

// Helper functions
const formatRole = (role: string): string => {
  switch (role) {
    case 'super_admin': return 'Super Admin';
    case 'admin': return 'Admin';
    case 'white_label': return 'White Label';
    default: return role || 'User';
  }
};

const formatStatus = (status: string): string => {
  switch (status) {
    case 'active': return 'Active';
    case 'inactive': return 'Inactive';
    case 'pending': return 'Pending';
    default: return status || 'Unknown';
  }
};

const getRoleBadgeVariant = (role: string): "admin" | "white_label" | "super_admin" | "default" => {
  switch (role) {
    case 'super_admin': return 'super_admin';
    case 'admin': return 'admin';
    case 'white_label': return 'white_label';
    default: return 'default';
  }
};

const getStatusBadgeVariant = (status: string): "active" | "inactive" | "pending" | "default" => {
  switch (status) {
    case 'active': return 'active';
    case 'inactive': return 'inactive';
    case 'pending': return 'pending';
    default: return 'default';
  }
};

export default CompactAdminManagement;
