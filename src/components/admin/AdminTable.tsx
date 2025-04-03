
import React from 'react';
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  Ban 
} from "lucide-react";
import { AdminUser } from '@/hooks/useAdminManagement';
import { format } from 'date-fns';

interface AdminTableProps {
  admins: AdminUser[];
  onEdit: (admin: AdminUser) => void;
  onDelete: (admin: AdminUser) => void;
  onManageRoles: (admin: AdminUser) => void;
  onSuspend: (adminId: string) => void;
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'destructive';
    case 'admin':
      return 'default';
    default:
      return 'secondary';
  }
};

const getStatusBadgeVariant = (status?: string) => {
  switch (status) {
    case 'suspended':
      return 'destructive';
    case 'pending':
      return 'warning';
    case 'active':
    default:
      return 'success';
  }
};

const AdminTable: React.FC<AdminTableProps> = ({
  admins,
  onEdit,
  onDelete,
  onManageRoles,
  onSuspend
}) => {
  if (admins.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No administrators found</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Company/Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map(admin => (
            <TableRow key={admin.id}>
              <TableCell>
                <Avatar className="h-8 w-8">
                  {admin.avatar ? (
                    <AvatarImage src={admin.avatar} alt={admin.name} />
                  ) : (
                    <AvatarFallback>
                      {admin.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">
                <div>
                  <p className="font-semibold">{admin.name}</p>
                  <p className="text-xs text-muted-foreground">{admin.email}</p>
                  {admin.phone && (
                    <p className="text-xs text-muted-foreground">{admin.phone}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(admin.role)}>
                  {admin.role === 'super_admin' ? 'Super Admin' : 
                   admin.role === 'admin' ? 'Admin' : 'User'}
                </Badge>
              </TableCell>
              <TableCell>
                {admin.company ? (
                  <div>
                    <p>{admin.company}</p>
                    {admin.position && (
                      <p className="text-xs text-muted-foreground">{admin.position}</p>
                    )}
                  </div>
                ) : admin.position ? (
                  admin.position
                ) : (
                  <span className="text-muted-foreground">Not specified</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(admin.status) as "default" | "destructive" | "outline" | "secondary" | "warning" | "success"}>
                  {admin.status || 'Active'}
                </Badge>
              </TableCell>
              <TableCell>
                {admin.joinDate ? format(admin.joinDate, 'PPP') : 'N/A'}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(admin)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onManageRoles(admin)}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Manage Roles
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onSuspend(admin.id)}
                      disabled={admin.status === 'suspended'}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Suspend
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(admin)}
                      className="text-destructive focus:text-destructive"
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
  );
};

export default AdminTable;
