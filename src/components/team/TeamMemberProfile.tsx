import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  MessageSquare,
  Building,
  MapPin,
  Briefcase,
  MoreVertical,
  Smartphone,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { TeamMember, WhatsAppAccount } from "@/services/teamService";
import { getWhatsAppAccounts, updateWhatsAppPermissions } from '@/services/teamService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TeamMemberProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember;
  currentUserRole: string;
  onEdit: () => void;
  onResetPassword?: (id: string) => void;
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const TeamMemberProfile: React.FC<TeamMemberProfileProps> = ({
  open,
  onOpenChange,
  member,
  currentUserRole,
  onEdit,
  onResetPassword,
  onActivate,
  onDeactivate,
  onDelete,
}) => {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);
  const [whatsappAccounts, setWhatsappAccounts] = useState<WhatsAppAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (open && member) {
      loadWhatsAppAccounts();
    }
  }, [open, member]);
  
  const loadWhatsAppAccounts = async () => {
    try {
      const accounts = await getWhatsAppAccounts();
      setWhatsappAccounts(accounts);
      
      if (member && accounts.length > 0) {
        const selectedIds = accounts
          .filter(acc => member.whatsappAccounts.includes(acc.account_name))
          .map(acc => acc.id);
        
        setSelectedAccountIds(selectedIds);
      }
    } catch (error) {
      console.error("Error loading WhatsApp accounts:", error);
    }
  };
  
  const handleSendEmail = () => {
    if (member?.email) {
      window.location.href = `mailto:${member.email}`;
      toast({
        title: "Opening email client",
        description: `Creating email to ${member.email}`
      });
    }
  };
  
  const handleCallPhone = () => {
    if (member?.phone) {
      window.location.href = `tel:${member.phone}`;
      toast({
        title: "Making call",
        description: `Calling ${member.phone}`
      });
    } else {
      toast({
        title: "No phone number available",
        variant: "destructive"
      });
    }
  };
  
  const handleSendMessage = () => {
    if (member) {
      toast({
        title: "Starting conversation",
        description: `Opening chat with ${member.name}`
      });
      // This would typically navigate to a chat with this team member
    }
  };
  
  const handleChangePermission = (accountId: string, checked: boolean) => {
    setSelectedAccountIds(prev => 
      checked 
        ? [...prev, accountId] 
        : prev.filter(id => id !== accountId)
    );
  };
  
  const handleSavePermissions = async () => {
    if (!member) return;
    
    setIsSaving(true);
    try {
      await updateWhatsAppPermissions(member.id, selectedAccountIds);
      
      toast({
        title: "Permissions updated",
        description: "WhatsApp account access updated successfully"
      });
      
      setIsEditPermissionsOpen(false);
    } catch (error) {
      console.error("Error updating WhatsApp permissions:", error);
      toast({
        title: "Error updating permissions",
        description: "Failed to update WhatsApp account access",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!member) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="text-green-500 mr-1 h-4 w-4" />;
      case 'inactive':
        return <XCircle className="text-gray-400 mr-1 h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canModify = currentUserRole === 'admin' || currentUserRole === 'super_admin';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <DialogTitle className="text-xl">Team Member Profile</DialogTitle>
              {canModify && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                      Edit Profile
                    </DropdownMenuItem>
                    {onResetPassword && (
                      <DropdownMenuItem onClick={() => onResetPassword(member.id)}>
                        Reset Password
                      </DropdownMenuItem>
                    )}
                    {member.status === 'inactive' && onActivate && (
                      <DropdownMenuItem onClick={() => onActivate(member.id)}>
                        Activate Account
                      </DropdownMenuItem>
                    )}
                    {member.status === 'active' && onDeactivate && (
                      <DropdownMenuItem onClick={() => onDeactivate(member.id)}>
                        Deactivate Account
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem 
                        className="text-red-600" 
                        onClick={() => setIsDeleteDialogOpen(true)}
                      >
                        Delete Account
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <div className="flex flex-col items-center text-center mb-4">
                <Avatar className="h-24 w-24 mb-2">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-medium">{member.name}</h3>
                <div className="flex items-center mt-1">
                  {getStatusIcon(member.status)}
                  <span className="text-muted-foreground capitalize">{member.status}</span>
                </div>
                <Badge className="mt-2">{member.role}</Badge>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex items-start space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Email Address</p>
                    <p>{member.email}</p>
                  </div>
                </div>

                {member.phone && (
                  <div className="flex items-start space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <p>{member.phone}</p>
                    </div>
                  </div>
                )}

                {member.department && (
                  <div className="flex items-start space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p>{member.department}</p>
                    </div>
                  </div>
                )}

                {member.position && (
                  <div className="flex items-start space-x-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Position</p>
                      <p>{member.position}</p>
                    </div>
                  </div>
                )}

                {member.company && (
                  <div className="flex items-start space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p>{member.company}</p>
                    </div>
                  </div>
                )}

                {member.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p>{member.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="flex justify-center space-x-2">
                <Button size="sm" variant="outline" onClick={handleSendEmail}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
                <Button size="sm" variant="outline" onClick={handleCallPhone} 
                  disabled={!member.phone}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </Button>
                <Button size="sm" variant="outline" onClick={handleSendMessage}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </div>
            </div>

            <div className="flex-1">
              <Tabs defaultValue="accounts">
                <TabsList className="mb-4">
                  <TabsTrigger value="accounts">WhatsApp Accounts</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                </TabsList>
                
                <TabsContent value="accounts">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Account Access</CardTitle>
                      {canModify && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditPermissionsOpen(true)}>
                          Edit Permissions
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      {member.whatsappAccounts && member.whatsappAccounts.length > 0 ? (
                        <div className="space-y-3">
                          {member.whatsappAccounts.map((account, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-md bg-accent/30">
                              <div className="flex items-center">
                                <Smartphone className="mr-2 h-4 w-4 text-primary" />
                                <span>{account}</span>
                              </div>
                              <Badge variant="outline">Active</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          This team member doesn't have access to any WhatsApp accounts.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Joined</TableCell>
                            <TableCell>{formatDate(member.last_active)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Last Active</TableCell>
                            <TableCell>{formatDate(member.last_active)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Status</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {getStatusIcon(member.status)}
                                <span className="capitalize">{member.status}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="activity">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Activity log will be available in a future update.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="stats">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Performance metrics will be available in a future update.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <DialogClose asChild>
            <Button variant="outline" className="mt-4">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditPermissionsOpen} onOpenChange={setIsEditPermissionsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit WhatsApp Access</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            <h4 className="text-sm font-medium mb-2">Select which accounts {member.name} can access:</h4>
            
            <div className="space-y-2">
              {whatsappAccounts.length > 0 ? (
                whatsappAccounts.map(account => (
                  <div key={account.id} className="flex items-center justify-between p-3 rounded-md border">
                    <div className="flex items-center">
                      <Smartphone className="mr-2 h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{account.account_name}</p>
                        <p className="text-xs text-muted-foreground">{account.phone_number}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedAccountIds.includes(account.id)}
                      onChange={(e) => handleChangePermission(account.id, e.target.checked)}
                    />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground py-2">No WhatsApp accounts available.</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditPermissionsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Permissions'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {onDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {member.name}'s account and remove all associated data.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  onDelete(member.id);
                  setIsDeleteDialogOpen(false);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default TeamMemberProfile;
