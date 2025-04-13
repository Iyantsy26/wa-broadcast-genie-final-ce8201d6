
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, MoreHorizontal, Users, Building2, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import NotAvailableView from './NotAvailableView';
import { UserRole } from '@/services/devices/deviceTypes';

interface UsersSettingsProps {
  currentRole: UserRole['role'] | null;
}

const UsersSettings: React.FC<UsersSettingsProps> = ({ currentRole }) => {
  // This component should only be visible to admin and above
  if (currentRole === 'user') {
    return (
      <NotAvailableView
        title="User Management Not Available"
        message="You need admin privileges or higher to manage users. Please contact your administrator for access."
        requiredRole="admin"
      />
    );
  }

  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Title and controls vary by role
  let roleHeading = '';
  let controlsSection = null;
  let userLimitsSection = null;
  
  if (currentRole === 'super_admin') {
    roleHeading = 'Super Admin Controls';
    controlsSection = (
      <div className="flex flex-wrap gap-3 mb-6">
        <Button variant="outline" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Create White Label Account
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Create Admin
        </Button>
      </div>
    );
    userLimitsSection = (
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3">Global User Limits</h3>
        <div>
          <Input 
            type="number" 
            defaultValue="1000" 
            className="max-w-xs mb-2"
          />
          <p className="text-sm text-muted-foreground">Maximum number of users allowed across all accounts</p>
        </div>
      </div>
    );
  } else if (currentRole === 'white_label') {
    roleHeading = 'White Label Admin Controls';
    controlsSection = (
      <div className="flex flex-wrap gap-3 mb-6">
        <Button variant="outline" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Create Admin
        </Button>
      </div>
    );
    userLimitsSection = (
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3">Organization User Limits</h3>
        <div>
          <Input 
            type="number" 
            defaultValue="100" 
            className="max-w-xs mb-2"
          />
          <p className="text-sm text-muted-foreground">Maximum number of users allowed in your organization</p>
        </div>
      </div>
    );
  } else if (currentRole === 'admin') {
    roleHeading = 'Admin Controls';
    controlsSection = (
      <div className="flex flex-wrap gap-3 mb-6">
        <Button variant="outline" className="flex items-center gap-2">
          <UserIcon className="h-4 w-4" />
          Create User
        </Button>
      </div>
    );
    userLimitsSection = (
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3">Team User Limits</h3>
        <div>
          <p className="text-sm mb-2">You have 24/50 users</p>
        </div>
      </div>
    );
  }

  // Mock data for users
  const users = [
    { 
      id: 1, 
      name: 'Jane Smith', 
      email: 'jane.smith@example.com', 
      role: currentRole === 'super_admin' ? 'white_label' : 
            currentRole === 'white_label' ? 'admin' : 'user', 
      avatar: '/placeholder.svg', 
      status: 'active',
      lastActive: '2025-04-12T09:45:00'
    },
    { 
      id: 2, 
      name: 'Mike Johnson', 
      email: 'mike.j@example.com', 
      role: currentRole === 'super_admin' ? 'admin' : 'admin', 
      avatar: '/placeholder.svg', 
      status: 'active',
      lastActive: '2025-04-08T14:30:00'
    },
    { 
      id: 3, 
      name: 'Sarah Williams', 
      email: 'sarah.w@example.com', 
      role: 'user', 
      avatar: '/placeholder.svg', 
      status: 'invited',
      lastActive: '2025-04-13T11:15:00'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions
        </p>
      </div>
      
      {roleHeading && <h2 className="text-xl font-semibold mb-4">{roleHeading}</h2>}
      
      {controlsSection}
      
      {userLimitsSection}
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Users & Permissions</CardTitle>
            <CardDescription>Manage team members and their account permissions</CardDescription>
          </div>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-10" />
              </div>
              <div className="flex gap-2 items-center">
                <Select 
                  defaultValue={roleFilter} 
                  onValueChange={(value) => setRoleFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {currentRole === 'super_admin' && (
                      <>
                        <SelectItem value="white_label">White Label</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </>
                    )}
                    {currentRole === 'white_label' && (
                      <SelectItem value="admin">Admin</SelectItem>
                    )}
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  defaultValue={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="invited">Invited</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="border rounded-md">
              <div className="grid grid-cols-12 p-4 text-sm font-medium text-muted-foreground bg-muted/50">
                <div className="col-span-5 md:col-span-3">Name</div>
                <div className="hidden md:block md:col-span-3">Email</div>
                <div className="col-span-3 md:col-span-2">Role</div>
                <div className="col-span-3 md:col-span-2">Status</div>
                <div className="col-span-1 md:col-span-2 text-right">Actions</div>
              </div>
              
              {users.map((user) => (
                <div key={user.id} className="grid grid-cols-12 p-4 border-t items-center">
                  <div className="col-span-5 md:col-span-3 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                    </div>
                  </div>
                  <div className="hidden md:block md:col-span-3 text-sm">{user.email}</div>
                  <div className="col-span-3 md:col-span-2">
                    <Badge variant={
                      user.role === 'admin' ? 'orange' : 
                      user.role === 'white_label' ? 'blue' : 
                      'outline'
                    } className="capitalize">
                      {user.role}
                    </Badge>
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Badge variant={
                      user.status === 'active' ? 'success' : 
                      user.status === 'invited' ? 'warning' :
                      'secondary'
                    } className="capitalize">
                      {user.status}
                    </Badge>
                  </div>
                  <div className="col-span-1 md:col-span-2 text-right flex justify-end gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button variant="primary">Save Changes</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersSettings;
