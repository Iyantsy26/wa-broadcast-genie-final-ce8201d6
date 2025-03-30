
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, Phone, Building, Clock, Shield, Smartphone 
} from "lucide-react";
import type { TeamMember } from "@/services/teamService";

interface TeamMemberProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember;
  onEdit: () => void;
}

const TeamMemberProfile = ({
  open,
  onOpenChange,
  member,
  onEdit
}: TeamMemberProfileProps) => {
  if (!member) return null;

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
          <Badge variant="outline" className="bg-green-100 text-green-800 border-0">
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-0">
            Inactive
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-0">
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Team Member Profile</DialogTitle>
          <DialogDescription>
            View detailed information about this team member
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-24 w-24">
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                {getRoleBadge(member.role)}
                {getStatusBadge(member.status)}
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                  <span>{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.department && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-muted-foreground mr-2" />
                    <span>{member.department}</span>
                  </div>
                )}
                {member.lastActive && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                    <span>Last active: {new Date(member.lastActive).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">WhatsApp Accounts</h4>
            {member.whatsappAccounts.length > 0 ? (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {member.whatsappAccounts.map((account, index) => (
                      <div key={index} className="flex items-center">
                        <Smartphone className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>{account}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4 text-muted-foreground">
                  No WhatsApp accounts assigned
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Role Permissions</h4>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <Shield className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">{member.role === 'admin' ? 'Administrator' : member.role === 'manager' ? 'Manager' : 'Agent'}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.role === 'admin' 
                        ? 'Full access to all system features and settings' 
                        : member.role === 'manager'
                        ? 'Department-level management and oversight'
                        : 'Handle customer conversations and basic tasks'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onEdit}>
            Edit Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberProfile;
