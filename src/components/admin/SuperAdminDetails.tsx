
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from '@supabase/supabase-js';
import { Edit, Key, Shield, Mail, Phone, Building, Home, Calendar, UserCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

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
  formState?: { wasUpdated: boolean; timestamp?: number };
}

const SuperAdminDetails = ({ user, profile, isEditing, onEdit, formState }: SuperAdminDetailsProps) => {
  const { toast } = useToast();
  
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`,
      });
    });
  };

  const lastUpdated = formState?.timestamp 
    ? `Last updated ${formatDistanceToNow(new Date(formState.timestamp), { addSuffix: true })}`
    : null;

  return (
    <Card className="w-full overflow-hidden border-2 border-primary/10 shadow-md">
      {formState?.wasUpdated && (
        <div className="bg-green-50 text-green-700 px-4 py-2 text-sm font-medium border-b border-green-100">
          Profile updated successfully! {lastUpdated}
        </div>
      )}
      
      <CardHeader className="relative bg-primary/5 pb-4">
        <div className="absolute right-4 top-4 flex gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Shield className="h-3 w-3 mr-1" />
            Super Admin
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold text-primary">Admin Profile Details</CardTitle>
        <CardDescription>
          View and manage your Super Administrator profile information
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* User ID Section */}
        <div className="bg-muted/50 rounded-lg p-4 border border-muted shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Key className="h-5 w-5 text-primary mr-3" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">System User ID</p>
                <p className="font-mono text-sm font-semibold">{profile.customId || "SSoo3"}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => copyToClipboard(profile.customId || "SSoo3", "User ID")}
              className="text-muted-foreground hover:text-primary"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Basic Details */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider">Basic Information</h3>
          <Separator className="bg-primary/10" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-muted hover:bg-muted/50 transition-colors">
              <UserCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Full Name</p>
                <p className="text-base font-medium">{profile.name || "Super Admin"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-muted hover:bg-muted/50 transition-colors group">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">Email Address</p>
                <p className="text-base font-medium truncate">{profile.email || "ssadmin@admin.com"}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => copyToClipboard(profile.email || "ssadmin@admin.com", "Email address")}
                className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-muted hover:bg-muted/50 transition-colors">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Phone Number</p>
                <p className="text-base font-medium">{profile.phone || "Not provided"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-muted hover:bg-muted/50 transition-colors">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Joined</p>
                <p className="text-base font-medium">{formattedDate}</p>
                <p className="text-xs text-muted-foreground">({timeAgo})</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Details */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider">Additional Information</h3>
          <Separator className="bg-primary/10" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-muted hover:bg-muted/50 transition-colors">
              <Building className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Company</p>
                <p className="text-base font-medium">{profile.company || "Not provided"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border border-muted hover:bg-muted/50 transition-colors">
              <Home className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Address</p>
                <p className="text-base font-medium">{profile.address || "Not provided"}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Biography */}
        {profile.bio && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider">Biography</h3>
            <Separator className="bg-primary/10" />
            <div className="p-3 bg-muted/30 rounded-md border border-muted">
              <p className="text-base">{profile.bio}</p>
            </div>
          </div>
        )}
        
        {/* Edit Button */}
        {!isEditing && (
          <Button 
            onClick={onEdit} 
            className="w-full mt-4"
            variant="default"
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
