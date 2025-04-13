
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, MoreHorizontal } from "lucide-react";
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

  // Mock data for users
  const users = [
    { 
      id: 1, 
      name: 'Alex Johnson', 
      email: 'alex@example.com', 
      role: 'admin', 
      avatar: '/placeholder.svg', 
      status: 'active',
      lastActive: '2025-04-08T14:30:00'
    },
    { 
      id: 2, 
      name: 'Maria Garcia', 
      email: 'maria@example.com', 
      role: 'user', 
      avatar: '/placeholder.svg', 
      status: 'active',
      lastActive: '2025-04-12T09:45:00'
    },
    { 
      id: 3, 
      name: 'John Smith', 
      email: 'john@example.com', 
      role: 'user', 
      avatar: '/placeholder.svg', 
      status: 'inactive',
      lastActive: '2025-03-28T16:20:00'
    },
    { 
      id: 4, 
      name: 'Sarah Williams', 
      email: 'sarah@example.com', 
      role: 'white_label', 
      avatar: '/placeholder.svg', 
      status: 'active',
      lastActive: '2025-04-13T11:15:00'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">
          Manage users and their permissions in your organization
        </p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage your team and their account permissions</CardDescription>
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
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="white_label">White Label</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="border rounded-md">
              <div className="grid grid-cols-12 p-4 text-sm font-medium text-muted-foreground bg-muted/50">
                <div className="col-span-5 md:col-span-3">User</div>
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
                      user.role === 'admin' ? 'purple' : 
                      user.role === 'white_label' ? 'blue' : 
                      'outline'
                    } className="capitalize">
                      {user.role}
                    </Badge>
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Badge variant={user.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                      {user.status}
                    </Badge>
                  </div>
                  <div className="col-span-1 md:col-span-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          {user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between py-2">
              <p className="text-sm text-muted-foreground">
                Showing <strong>4</strong> of <strong>4</strong> users
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersSettings;
