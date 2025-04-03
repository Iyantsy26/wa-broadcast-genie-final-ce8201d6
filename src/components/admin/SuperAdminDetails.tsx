
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from '@supabase/supabase-js';
import { Edit, Key, Shield, Mail, Phone, Building, Home, Calendar, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from 'date-fns';

interface SuperAdminDetailsProps {
  user: User | null;
  profile: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
    customId?: string;
    bio?: string;
  };
  isEditing: boolean;
  onEdit: () => void;
}

const SuperAdminDetails = ({ user, profile, isEditing, onEdit }: SuperAdminDetailsProps) => {
  // Generate a joined date (either from user or a fallback)
  const joinedDate = user?.created_at 
    ? new Date(user.created_at) 
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Fallback to 30 days ago
  
  const formattedDate = joinedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const timeAgo = formatDistanceToNow(joinedDate, { addSuffix: true });

  return (
    <Card className="w-full">
      <CardHeader className="relative">
        <div className="absolute right-4 top-4">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Shield className="h-3 w-3 mr-1" />
            Super Admin
          </Badge>
        </div>
        <CardTitle>Admin Profile Details</CardTitle>
        <CardDescription>
          View and manage your Super Administrator profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User ID Section */}
        <div className="bg-muted/50 rounded-md p-3 border border-muted">
          <div className="flex items-center">
            <Key className="h-4 w-4 text-muted-foreground mr-2" />
            <div>
              <p className="text-xs text-muted-foreground">System User ID</p>
              <p className="font-mono text-sm font-semibold">{profile.customId || "SSoo3"}</p>
            </div>
          </div>
        </div>

        {/* Basic Details */}
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium">Basic Information</h3>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-2">
              <UserCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-sm">{profile.name || "Super Admin"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="text-sm">{profile.email || "ssadmin@admin.com"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="text-sm">{profile.phone || "Not provided"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="text-sm">{formattedDate} ({timeAgo})</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Details */}
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium">Additional Information</h3>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-2">
              <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="text-sm">{profile.company || "Not provided"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Home className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm">{profile.address || "Not provided"}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Biography */}
        {profile.bio && (
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium">Biography</h3>
            <Separator />
            <p className="text-sm pt-2">{profile.bio}</p>
          </div>
        )}
        
        {/* Edit Button */}
        {!isEditing && (
          <Button 
            onClick={onEdit} 
            className="w-full mt-4"
            variant="outline"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SuperAdminDetails;
