
import React from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, XCircle, Smartphone 
} from "lucide-react";
import type { TeamMember } from "@/services/teamService";

interface TeamMembersListProps {
  members: TeamMember[];
  onViewProfile: (id: string) => void;
}

const TeamMembersList = ({
  members,
  onViewProfile
}: TeamMembersListProps) => {
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div 
                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                onClick={() => onViewProfile(member.id)}
              >
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TeamMembersList;
