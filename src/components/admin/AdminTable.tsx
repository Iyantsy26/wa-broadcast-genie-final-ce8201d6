
import React from 'react';
import { format } from "date-fns";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Edit,
  Trash,
  MoreVertical,
  Shield,
  UserX,
  ShieldAlert,
  CheckCircle,
} from "lucide-react";
import { AdminUser } from "@/hooks/useAdminManagement";

interface AdminTableProps {
  admins: AdminUser[];
  onEdit: (admin: AdminUser) => void;
  onDelete: (admin: AdminUser) => void;
  onManageRoles: (admin: AdminUser) => void;
  onSuspend: (adminId: string) => void;
}

const AdminTable: React.FC<AdminTableProps> = ({
  admins,
  onEdit,
  onDelete,
  onManageRoles,
  onSuspend
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No administrators found
              </TableCell>
            </TableRow>
          ) : (
            admins.map((admin) => (
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
                <TableCell className="font-medium">{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.company}</TableCell>
                <TableCell>
                  {admin.role === 'super_admin' && (
                    <Badge variant="destructive" className="flex items-center w-fit">
                      <ShieldAlert className="h-3 w-3 mr-1" />
                      Super Admin
                    </Badge>
                  )}
                  {admin.role === 'admin' && (
                    <Badge variant="default" className="flex items-center w-fit">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {admin.role === 'user' && (
                    <Badge variant="secondary" className="flex items-center w-fit">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      User
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {admin.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{format(admin.joinDate, 'PP')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(admin)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onManageRoles(admin)}>
                        <Shield className="h-4 w-4 mr-2" />
                        Manage Roles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSuspend(admin.id)}>
                        <UserX className="h-4 w-4 mr-2" />
                        Suspend
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(admin)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminTable;
