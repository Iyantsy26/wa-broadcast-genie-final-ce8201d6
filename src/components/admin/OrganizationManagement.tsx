
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Building,
  Calendar,
  Check,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import OrganizationForm from "./OrganizationForm";

const OrganizationManagement = () => {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fetchOrganizations = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      // Fetch organizations directly without using RLS policies
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching organizations:', error);
        setErrorMsg(`Failed to load organizations: ${error.message}`);
        toast({
          title: 'Error',
          description: `Failed to load organizations: ${error.message}`,
          variant: 'destructive',
        });
        setOrganizations([]);
        return;
      }
      
      // For each org, get member count separately
      const orgsWithMemberCount = await Promise.all((data || []).map(async (org) => {
        try {
          // Use a direct count query to avoid RLS recursion
          const { count, error: countError } = await supabase
            .from('organization_members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id);
          
          if (countError) {
            console.error(`Error getting member count for org ${org.id}:`, countError);
            return {
              ...org,
              memberCount: 0,
            };
          }
          
          return {
            ...org,
            memberCount: count || 0,
          };
        } catch (err) {
          console.error(`Error getting member count for org ${org.id}:`, err);
          return {
            ...org,
            memberCount: 0,
          };
        }
      }));
      
      setOrganizations(orgsWithMemberCount);
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
      setErrorMsg(`Failed to load organizations: ${error.message || 'Unknown error'}`);
      toast({
        title: 'Error',
        description: 'Failed to load organizations. Please try again later.',
        variant: 'destructive',
      });
      
      // Set empty array to prevent infinite loading state
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrganizations();
  }, []);
  
  const filteredOrganizations = organizations.filter(org => {
    const searchLower = searchTerm.toLowerCase();
    return (
      org.name?.toLowerCase().includes(searchLower) ||
      org.slug?.toLowerCase().includes(searchLower)
    );
  });
  
  const handleEditOrg = (org: any) => {
    setSelectedOrg(org);
    setEditDialogOpen(true);
  };
  
  const handleDeleteOrg = async (orgId: string) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Delete organization
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);
        
      if (error) {
        console.error('Error deleting organization:', error);
        throw error;
      }
      
      toast({
        title: 'Organization Deleted',
        description: 'The organization has been deleted successfully',
      });
      
      fetchOrganizations();
    } catch (error: any) {
      console.error('Error deleting organization:', error);
      toast({
        title: 'Error',
        description: `Failed to delete organization: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleViewDetails = (orgId: string) => {
    // This would navigate to a detailed view of the organization
    toast({
      title: 'View Organization',
      description: `Viewing details for organization ${orgId}`,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Organizations</CardTitle>
            <CardDescription>
              Manage your platform's organizations
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Organization
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading organizations...</p>
            </div>
          ) : errorMsg ? (
            <div className="text-center py-8">
              <Building className="h-8 w-8 mx-auto text-destructive opacity-70" />
              <p className="mt-2 text-sm text-destructive">{errorMsg}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => fetchOrganizations()}
              >
                Try Again
              </Button>
            </div>
          ) : filteredOrganizations.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-2 text-sm text-muted-foreground">No organizations found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrganizations.map((org) => (
                <Card key={org.id} className="overflow-hidden">
                  <div className="h-3 bg-primary" />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(org.id)}>
                            <Building className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditOrg(org)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteOrg(org.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>
                      {org.slug}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center text-muted-foreground">
                          <Users className="mr-1 h-4 w-4" />
                          Members
                        </span>
                        <span>{org.memberCount}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center text-muted-foreground">
                          <Calendar className="mr-1 h-4 w-4" />
                          Created
                        </span>
                        <span>{new Date(org.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center text-muted-foreground">
                          Status
                        </span>
                        <span className="flex items-center">
                          {org.is_active ? (
                            <>
                              <Check className="mr-1 h-3 w-3 text-green-500" />
                              <span className="text-green-600">Active</span>
                            </>
                          ) : (
                            <span className="text-gray-500">Inactive</span>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => handleViewDetails(org.id)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create Organization Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to your platform
            </DialogDescription>
          </DialogHeader>
          
          <OrganizationForm
            onSuccess={() => {
              setCreateDialogOpen(false);
              fetchOrganizations();
            }}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Organization Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update this organization's details
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrg && (
            <OrganizationForm
              organizationData={selectedOrg}
              onSuccess={() => {
                setEditDialogOpen(false);
                fetchOrganizations();
              }}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationManagement;
