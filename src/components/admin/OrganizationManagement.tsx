
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import OrganizationForm from "./OrganizationForm";
import OrganizationsList from "./organizations/OrganizationsList";
import OrganizationSearch from "./organizations/OrganizationSearch";
import { useOrganizations } from "@/hooks/useOrganizations";

const OrganizationManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  
  const {
    organizations,
    isLoading,
    errorMsg,
    fetchOrganizations,
    handleDeleteOrg
  } = useOrganizations();
  
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
            <OrganizationSearch 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
          
          <OrganizationsList
            isLoading={isLoading}
            errorMsg={errorMsg}
            organizations={organizations}
            filteredOrganizations={filteredOrganizations}
            fetchOrganizations={fetchOrganizations}
            handleEditOrg={handleEditOrg}
            handleDeleteOrg={handleDeleteOrg}
            handleViewDetails={handleViewDetails}
          />
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
