
import React from 'react';
import { Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrganizationCard from './OrganizationCard';

interface OrganizationsListProps {
  isLoading: boolean;
  errorMsg: string | null;
  organizations: any[];
  filteredOrganizations: any[];
  fetchOrganizations: () => void;
  handleEditOrg: (org: any) => void;
  handleDeleteOrg: (orgId: string) => void;
  handleViewDetails: (orgId: string) => void;
}

const OrganizationsList: React.FC<OrganizationsListProps> = ({
  isLoading,
  errorMsg,
  organizations,
  filteredOrganizations,
  fetchOrganizations,
  handleEditOrg,
  handleDeleteOrg,
  handleViewDetails,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading organizations...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
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
    );
  }

  if (filteredOrganizations.length === 0) {
    return (
      <div className="text-center py-8">
        <Building className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
        <p className="mt-2 text-sm text-muted-foreground">No organizations found</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredOrganizations.map((org) => (
        <OrganizationCard 
          key={org.id}
          org={org}
          onEditOrg={handleEditOrg}
          onDeleteOrg={handleDeleteOrg}
          onViewDetails={handleViewDetails}
        />
      ))}
    </div>
  );
};

export default OrganizationsList;
