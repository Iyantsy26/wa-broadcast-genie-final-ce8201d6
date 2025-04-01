
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building,
  Calendar,
  Check,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

interface OrganizationCardProps {
  org: any;
  onEditOrg: (org: any) => void;
  onDeleteOrg: (orgId: string) => void;
  onViewDetails: (orgId: string) => void;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({
  org,
  onEditOrg,
  onDeleteOrg,
  onViewDetails,
}) => {
  return (
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
              <DropdownMenuItem onClick={() => onViewDetails(org.id)}>
                <Building className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditOrg(org)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDeleteOrg(org.id)}
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
          onClick={() => onViewDetails(org.id)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrganizationCard;
