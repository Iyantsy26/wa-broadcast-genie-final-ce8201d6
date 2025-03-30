
import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, User, Shield, Lock, Edit, Trash2, 
  CheckCircle, XCircle, Smartphone 
} from "lucide-react";
import type { TeamMember } from "@/services/teamService";
import { useToast } from "@/hooks/use-toast";

interface TeamMembersListProps {
  members: TeamMember[];
  onViewProfile: (id: string) => void;
  onEditMember: (id: string) => void;
  onChangeRole: (id: string) => void;
  onResetPassword: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
}

const TeamMembersList = ({
  members,
  onViewProfile,
  onEditMember,
  onChangeRole,
  onResetPassword,
  onActivate,
  onDeactivate,
  onDelete
}: TeamMembersListProps) => {
  const { toast } = useToast();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="default" className="bg-purple-500">
            Administrator
          </Badge>
        );
      case 'manager':
        return (
          <Badge variant="default" className="bg-blue-500">
            Manager
          </Badge>
        );
      case 'agent':
        return (
          <Badge variant="outline">
            Agent
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></div>
            <span className="text-sm text-green-600">Active</span>
          </div>
        );
      case 'inactive':
        return (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-gray-400 mr-1.5"></div>
            <span className="text-sm text-gray-600">Inactive</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-amber-500 mr-1.5"></div>
            <span className="text-sm text-amber-600">Pending</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>WhatsApp Accounts</TableHead>
          <TableHead>Last Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.email}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {getRoleBadge(member.role)}
            </TableCell>
            <TableCell>
              {member.department || '—'}
            </TableCell>
            <TableCell>
              {getStatusBadge(member.status)}
            </TableCell>
            <TableCell>
              {member.whatsappAccounts.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {member.whatsappAccounts.map((account, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-100 border-0">
                      <Smartphone className="h-3 w-3 mr-1" />
                      {account}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">None</span>
              )}
            </TableCell>
            <TableCell>
              {member.lastActive ? (
                new Date(member.lastActive).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              ) : (
                '—'
              )}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewProfile(member.id)}>
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditMember(member.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeRole(member.id)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Change Role
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onResetPassword(member.id)}>
                    <Lock className="mr-2 h-4 w-4" />
                    Reset Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {member.status === 'active' ? (
                    <DropdownMenuItem onClick={() => onDeactivate(member.id)}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onActivate(member.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Activate
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => onDelete(member.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TeamMembersList;
