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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Plus, 
  Search,
  Edit,
  CheckCircle,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  TeamMember, 
  Department, 
  Role, 
  getTeamMembers, 
  getDepartments, 
  getRoles,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  activateTeamMember,
  deactivateTeamMember,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  updateRolePermissions
} from "@/services/teamService";

import TeamMembersList from '@/components/team/TeamMembersList';
import AddTeamMemberDialog from '@/components/team/AddTeamMemberDialog';
import DepartmentCard from '@/components/team/DepartmentCard';
import DepartmentForm from '@/components/team/DepartmentForm';
import RolePermissionsForm from '@/components/team/RolePermissionsForm';
import TeamMemberProfile from '@/components/team/TeamMemberProfile';
import { supabase } from "@/integrations/supabase/client";

const TeamManagement = () => {
  const { toast } = useToast();
  
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all-status');
  
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [isEditDepartmentOpen, setIsEditDepartmentOpen] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState<TeamMember | undefined>();
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>();
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  const [loading, setLoading] = useState(true);

  const currentUserRole = 'admin';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Initial data fetch
        const [teamData, departmentData, roleData] = await Promise.all([
          getTeamMembers(),
          getDepartments(),
          getRoles()
        ]);
        
        setMembers(teamData);
        setDepartments(departmentData);
        setRoles(roleData);
      } catch (error) {
        console.error('Error fetching team data:', error);
        toast({
          title: "Error",
          description: "Failed to load team data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up real-time subscription for team members
    const teamMembersChannel = supabase
      .channel('team_members_changes')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public',
          table: 'team_members'
        }, 
        async (payload) => {
          console.log('Team members change detected:', payload);
          
          // Handle different change types
          if (payload.eventType === 'INSERT') {
            const { data: newMember, error } = await supabase
              .from('team_members')
              .select('*, department_id')
              .eq('id', payload.new.id)
              .single();
              
            if (!error && newMember) {
              // Process the new member to match our interface
              const { data: departmentData } = await supabase
                .from('departments')
                .select('name')
                .eq('id', newMember.department_id)
                .maybeSingle();
                
              const processedMember: TeamMember = {
                id: newMember.id,
                name: newMember.name,
                email: newMember.email,
                phone: newMember.phone,
                avatar: newMember.avatar,
                role: newMember.role as 'admin' | 'manager' | 'agent',
                status: newMember.status as 'active' | 'inactive' | 'pending',
                company: newMember.company,
                position: newMember.position,
                address: newMember.address,
                whatsappAccounts: [],
                department: departmentData?.name,
                lastActive: newMember.last_active
              };
              
              setMembers(prevMembers => [...prevMembers.filter(m => m.id !== processedMember.id), processedMember]);
            } else {
              // If we couldn't get details, fetch all team members
              const updatedMembers = await getTeamMembers();
              setMembers(updatedMembers);
            }
            
            toast({
              title: "Team member added",
              description: "A new team member has been added",
            });
          } else if (payload.eventType === 'UPDATE') {
            // For updates, fetch the full member data
            const { data: updatedMember, error } = await supabase
              .from('team_members')
              .select('*, department_id')
              .eq('id', payload.new.id)
              .single();
              
            if (!error && updatedMember) {
              // Get department name
              const { data: departmentData } = await supabase
                .from('departments')
                .select('name')
                .eq('id', updatedMember.department_id)
                .maybeSingle();
                
              const processedMember: TeamMember = {
                id: updatedMember.id,
                name: updatedMember.name,
                email: updatedMember.email,
                phone: updatedMember.phone,
                avatar: updatedMember.avatar,
                role: updatedMember.role as 'admin' | 'manager' | 'agent',
                status: updatedMember.status as 'active' | 'inactive' | 'pending',
                company: updatedMember.company,
                position: updatedMember.position,
                address: updatedMember.address,
                whatsappAccounts: [],
                department: departmentData?.name,
                lastActive: updatedMember.last_active
              };
              
              setMembers(prevMembers => 
                prevMembers.map(m => m.id === processedMember.id ? processedMember : m)
              );
            } else {
              // If we couldn't get details, fetch all team members
              const updatedMembers = await getTeamMembers();
              setMembers(updatedMembers);
            }
            
            toast({
              title: "Team member updated",
              description: "Team member information has been updated",
            });
          } else if (payload.eventType === 'DELETE') {
            // For deletes, remove from state
            setMembers(prevMembers => 
              prevMembers.filter(member => member.id !== payload.old.id)
            );
            
            toast({
              title: "Team member removed",
              description: "A team member has been removed from the system",
            });
          }
        }
      )
      .subscribe();
      
    // Set up real-time subscription for departments
    const departmentsChannel = supabase
      .channel('departments_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'departments'
        }, 
        async (payload) => {
          console.log('Departments change detected:', payload);
          
          // Update departments using the same pattern as for team members
          if (payload.eventType === 'INSERT') {
            // Fetch the new department with member count
            const updatedDepartments = await getDepartments();
            setDepartments(updatedDepartments);
            
            toast({
              title: "Department added",
              description: "A new department has been created",
            });
          } else if (payload.eventType === 'UPDATE') {
            // Fetch updated departments
            const updatedDepartments = await getDepartments();
            setDepartments(updatedDepartments);
            
            toast({
              title: "Department updated",
              description: "Department information has been updated",
            });
          } else if (payload.eventType === 'DELETE') {
            // Remove the deleted department
            setDepartments(prevDepartments => 
              prevDepartments.filter(dept => dept.id !== payload.old.id)
            );
            
            toast({
              title: "Department removed",
              description: "A department has been removed from the system",
            });
          }
        }
      )
      .subscribe();
    
    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(teamMembersChannel);
      supabase.removeChannel(departmentsChannel);
    };
  }, [toast]);

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      searchQuery === '' || 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    const matchesStatus = 
      statusFilter === 'all-status' || 
      member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddMemberSuccess = async (newMember?: TeamMember) => {
    if (newMember) {
      toast({
        title: "Team member added",
        description: `${newMember.name} has been added to the team`,
      });
    }
  };

  const handleViewProfile = (id: string) => {
    const member = members.find(m => m.id === id);
    setSelectedMember(member);
    setIsViewProfileOpen(true);
  };

  const handleEditMember = () => {
    setIsEditMemberOpen(true);
  };

  const handleChangeRole = (id: string) => {
    const member = members.find(m => m.id === id);
    setSelectedMember(member);
    setIsChangeRoleOpen(true);
  };

  const handleResetPassword = (id: string) => {
    toast({
      title: "Password reset email sent",
      description: "An email has been sent with password reset instructions",
    });
  };

  const handleActivateMember = async (id: string) => {
    try {
      await activateTeamMember(id);
      
      toast({
        title: "Team member activated",
        description: `The team member has been activated`,
      });
    } catch (error) {
      console.error('Error activating team member:', error);
      toast({
        title: "Error",
        description: "Failed to activate team member",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateMember = async (id: string) => {
    try {
      await deactivateTeamMember(id);
      
      toast({
        title: "Team member deactivated",
        description: `The team member has been deactivated`,
      });
    } catch (error) {
      console.error('Error deactivating team member:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate team member",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteTeamMember(id);
      
      toast({
        title: "Team member removed",
        description: "The team member has been removed",
      });
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    }
  };

  const handleAddDepartment = async (department: Partial<Department>) => {
    try {
      if (!department.name) {
        throw new Error("Department name is required");
      }
      
      await addDepartment({
        name: department.name,
        description: department.description,
        memberCount: 0,
        leadName: department.leadName,
      });
      
      toast({
        title: "Department created",
        description: `${department.name} department has been created`,
      });
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        title: "Error",
        description: "Failed to create department",
        variant: "destructive",
      });
    }
  };

  const handleEditDepartment = (id: string) => {
    const department = departments.find(d => d.id === id);
    setSelectedDepartment(department);
    setIsEditDepartmentOpen(true);
  };

  const handleUpdateDepartment = async (department: Partial<Department>) => {
    try {
      if (!department.id || !department.name) {
        throw new Error("Invalid department data");
      }
      
      await updateDepartment(department.id, department);
      
      toast({
        title: "Department updated",
        description: `${department.name} has been updated`,
      });
    } catch (error) {
      console.error('Error updating department:', error);
      toast({
        title: "Error",
        description: "Failed to update department",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await deleteDepartment(id);
      
      toast({
        title: "Department deleted",
        description: "The department has been deleted",
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  const handleAddMembersToDepartment = (id: string) => {
    const department = departments.find(d => d.id === id);
    
    toast({
      title: "Add members",
      description: `You can now add members to ${department?.name}`,
    });
    
    // This would typically open a dialog to add members to the department
  };

  const handleViewDepartmentAnalytics = (id: string) => {
    toast({
      title: "Department analytics",
      description: "Viewing department analytics",
    });
    
    // This would typically navigate to an analytics page filtered for this department
  };

  const handleViewDepartmentMembers = (id: string) => {
    const department = departments.find(d => d.id === id);
    
    toast({
      title: "Department members",
      description: `Viewing members of ${department?.name}`,
    });
    
    // This would typically show a dialog or navigate to a page showing the members of this department
  };

  const handleViewDepartmentConversations = (id: string) => {
    const department = departments.find(d => d.id === id);
    
    toast({
      title: "Department conversations",
      description: `Viewing conversations for ${department?.name}`,
    });
    
    // This would typically navigate to the conversations page filtered for this department
  };

  const handleEditRole = (id: string) => {
    const role = roles.find(r => r.id === id);
    setSelectedRole(role);
    setIsEditRoleOpen(true);
  };

  const handleUpdateRolePermissions = async () => {
    try {
      // This would be handled by the RolePermissionsForm component
      toast({
        title: "Permissions updated",
        description: "Role permissions have been updated",
      });
      
      // Refresh the roles data
      const updatedRoles = await getRoles();
      setRoles(updatedRoles);
    } catch (error) {
      console.error('Error updating role permissions:', error);
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your team members, departments, and roles
          </p>
        </div>
        
        <Button onClick={() => setIsAddMemberOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="mt-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select 
                defaultValue="all"
                value={roleFilter}
                onValueChange={setRoleFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                  <SelectItem value="manager">Managers</SelectItem>
                  <SelectItem value="agent">Agents</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                defaultValue="all-status"
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                View and manage your team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <p className="text-muted-foreground">Loading team members...</p>
                </div>
              ) : (
                <TeamMembersList
                  members={filteredMembers}
                  onViewProfile={handleViewProfile}
                  onActivate={handleActivateMember}
                  onDeactivate={handleDeactivateMember}
                  onResetPassword={handleResetPassword}
                  onDelete={handleDeleteMember}
                />
              )}
            </CardContent>
          </Card>
          
          <AddTeamMemberDialog
            open={isAddMemberOpen}
            onOpenChange={setIsAddMemberOpen}
            departments={departments}
            onSuccess={handleAddMemberSuccess}
          />
          
          <TeamMemberProfile
            open={isViewProfileOpen}
            onOpenChange={setIsViewProfileOpen}
            member={selectedMember}
            currentUserRole={currentUserRole}
            onEdit={handleEditMember}
          />
          
          {selectedMember && isEditMemberOpen && (
            <AddTeamMemberDialog
              open={isEditMemberOpen}
              onOpenChange={setIsEditMemberOpen}
              departments={departments}
              editMember={selectedMember}
              onSuccess={(updatedMember) => {
                if (updatedMember) {
                  setSelectedMember(updatedMember);
                }
                
                setIsEditMemberOpen(false);
              }}
            />
          )}
        </TabsContent>
        
        <TabsContent value="departments" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                className="pl-8"
              />
            </div>
            
            <Button onClick={() => setIsAddDepartmentOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Department
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Loading departments...</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {departments.map((department) => (
                <DepartmentCard
                  key={department.id}
                  department={department}
                  onEdit={handleEditDepartment}
                  onAddMembers={handleAddMembersToDepartment}
                  onViewAnalytics={handleViewDepartmentAnalytics}
                  onDelete={handleDeleteDepartment}
                  onViewMembers={handleViewDepartmentMembers}
                  onViewConversations={handleViewDepartmentConversations}
                />
              ))}
            </div>
          )}
          
          <DepartmentForm
            open={isAddDepartmentOpen}
            onOpenChange={setIsAddDepartmentOpen}
            teamMembers={members.filter(m => m.status === 'active')}
            onSave={handleAddDepartment}
          />
          
          {selectedDepartment && (
            <DepartmentForm
              open={isEditDepartmentOpen}
              onOpenChange={setIsEditDepartmentOpen}
              department={selectedDepartment}
              teamMembers={members.filter(m => m.status === 'active')}
              onSave={handleUpdateDepartment}
            />
          )}
        </TabsContent>
        
        <TabsContent value="roles" className="mt-6 space-y-6">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{role.name}</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditRole(role.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Permissions
                  </Button>
                </div>
                <CardDescription>
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {role.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">{permission}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {selectedRole && (
            <RolePermissionsForm
              open={isEditRoleOpen}
              onOpenChange={setIsEditRoleOpen}
              role={selectedRole}
              onSuccess={handleUpdateRolePermissions}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamManagement;

function handleAddMembersToDepartment(id: string): void {
  console.log('Add members to department:', id);
}

function handleViewDepartmentAnalytics(id: string): void {
  console.log('View department analytics:', id);
}

function handleViewDepartmentMembers(id: string): void {
  console.log('View department members:', id);
}

function handleViewDepartmentConversations(id: string): void {
  console.log('View department conversations:', id);
}


