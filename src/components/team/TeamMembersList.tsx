
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserX,
  RefreshCw,
  Lock,
  Unlock,
} from "lucide-react";
import { TeamMember } from '@/services/teamService';

interface TeamMembersListProps {
  members: TeamMember[];
  onViewProfile: (id: string) => void;
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  onResetPassword?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({
  members,
  onViewProfile,
  onActivate,
  onDeactivate,
  onResetPassword,
  onDelete,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="mr-2 h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="mr-2 h-4 w-4 text-gray-400" />;
      case 'pending':
        return <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-blue-500 text-white border-0">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-purple-500 text-white border-0">Manager</Badge>;
      case 'agent':
        return <Badge className="bg-emerald-500 text-white border-0">Agent</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length > 0 ? (
            members.map((member) => (
              <TableRow key={member.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium" onClick={() => onViewProfile(member.id)}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {member.avatar ? (
                        <AvatarImage src={member.avatar} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div>{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell onClick={() => onViewProfile(member.id)}>
                  {getRoleBadge(member.role)}
                </TableCell>
                <TableCell onClick={() => onViewProfile(member.id)}>
                  <div className="flex items-center">
                    {getStatusBadge(member.status)}
                    {member.status === 'pending' && onActivate && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="ml-2 h-7 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onActivate(member.id);
                        }}
                      >
                        Activate
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell onClick={() => onViewProfile(member.id)}>
                  {member.department || '—'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewProfile(member.id)}>
                        View Profile
                      </DropdownMenuItem>
                      
                      {member.status === 'pending' && onActivate && (
                        <DropdownMenuItem onClick={() => onActivate(member.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      
                      {member.status === 'active' && onDeactivate && (
                        <DropdownMenuItem onClick={() => onDeactivate(member.id)}>
                          <Lock className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      )}
                      
                      {member.status === 'inactive' && onActivate && (
                        <DropdownMenuItem onClick={() => onActivate(member.id)}>
                          <Unlock className="mr-2 h-4 w-4" />
                          Reactivate
                        </DropdownMenuItem>
                      )}
                      
                      {onResetPassword && (
                        <DropdownMenuItem onClick={() => onResetPassword(member.id)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>
                      )}
                      
                      {onDelete && (
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(member.id)}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No team members found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeamMembersList;
