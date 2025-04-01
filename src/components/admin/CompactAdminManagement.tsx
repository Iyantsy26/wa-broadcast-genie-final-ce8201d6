
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Mail,
  Edit,
  UserX,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import AddAdministratorDialog from './AddAdministratorDialog';
import AdminDetailsDialog from './AdminDetailsDialog';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  created_at: string;
  is_super_admin: boolean;
}

const CompactAdminManagement = () => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isViewAdminOpen, setIsViewAdminOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchAdmins();
  }, []);
  
  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .or('role.eq.admin,role.eq.super_admin,role.eq.white_label')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setAdmins(data || []);
    } catch (error) {
      console.error('Error fetching administrators:', error);
      toast({
        title: "Error",
        description: "Failed to load administrators",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update the local state
      setAdmins(prevAdmins => prevAdmins.map(admin => 
        admin.id === id ? { ...admin, status } : admin
      ));
      
      toast({
        title: "Status Updated",
        description: `Administrator status has been updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating administrator status:', error);
      toast({
        title: "Error",
        description: "Failed to update administrator status",
        variant: "destructive",
      });
    }
  };
  
  const handleResetPassword = async (id: string, email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      toast({
        title: "Password Reset",
        description: "Password reset email has been sent",
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: "Failed to send password reset email",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteAdmin = async (id: string) => {
    if (!confirm("Are you sure you want to delete this administrator?")) {
      return;
    }
    
    try {
      // First try to delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      
      if (authError) {
        console.warn('Error deleting auth user (may not exist):', authError);
      }
      
      // Then delete the team member record
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update the local state
      setAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== id));
      
      toast({
        title: "Administrator Deleted",
        description: "The administrator has been deleted",
      });
    } catch (error) {
      console.error('Error deleting administrator:', error);
      toast({
        title: "Error",
        description: "Failed to delete administrator",
        variant: "destructive",
      });
    }
  };
  
  const handleViewAdmin = (id: string) => {
    setSelectedAdminId(id);
    setIsViewAdminOpen(true);
  };
  
  const filteredAdmins = admins.filter(admin => {
    const query = searchQuery.toLowerCase();
    return (
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query) ||
      admin.role.toLowerCase().includes(query)
    );
  });
  
  const getRoleBadge = (role: string, isSuperAdmin: boolean) => {
    if (isSuperAdmin || role === 'super_admin') {
      return (
        <Badge className="bg-purple-500 text-white border-0">
          Super Admin
        </Badge>
      );
    }
    
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-blue-500 text-white border-0">
            Admin
          </Badge>
        );
      case 'white_label':
        return (
          <Badge className="bg-emerald-500 text-white border-0">
            White Label
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {role}
          </Badge>
        );
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search administrators..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button onClick={() => setIsAddAdminOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Administrator
        </Button>
      </div>
      
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-xl flex items-center">
            <Shield className="mr-2 h-5 w-5 text-primary" />
            Administrators
          </CardTitle>
          <CardDescription>
            Manage system administrators and their access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAdmins.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Name</TableHead>
                    <TableHead className="w-1/4">Email</TableHead>
                    <TableHead className="w-1/6">Role</TableHead>
                    <TableHead className="w-1/6">Status</TableHead>
                    <TableHead className="w-1/6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow 
                      key={admin.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewAdmin(admin.id)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {admin.avatar ? (
                              <AvatarImage src={admin.avatar} alt={admin.name} />
                            ) : (
                              <AvatarFallback className="bg-primary/10">
                                {admin.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          {admin.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="text-sm">{admin.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(admin.role, admin.is_super_admin)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(admin.status)}
                          <span className="text-sm capitalize">{admin.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleViewAdmin(admin.id);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              View & Edit
                            </DropdownMenuItem>
                            {admin.status !== 'active' && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(admin.id, 'active');
                              }}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {admin.status !== 'inactive' && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(admin.id, 'inactive');
                              }}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleResetPassword(admin.id, admin.email);
                            }}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-500 focus:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAdmin(admin.id);
                              }}
                            >
                              <UserX className="mr-2 h-4 w-4" />
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? (
                <>No administrators found matching "{searchQuery}"</>
              ) : (
                <>No administrators found</>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <AddAdministratorDialog
        open={isAddAdminOpen}
        onOpenChange={setIsAddAdminOpen}
        onSuccess={fetchAdmins}
      />
      
      <AdminDetailsDialog
        open={isViewAdminOpen}
        onClose={() => setIsViewAdminOpen(false)}
        adminId={selectedAdminId}
        onSave={fetchAdmins}
      />
    </div>
  );
};

export default CompactAdminManagement;
