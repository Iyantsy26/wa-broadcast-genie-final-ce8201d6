
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Building,
  CreditCard,
  Plus,
  Users,
  Palette,
  Smartphone,
  Search,
  BarChart,
  Settings,
  User,
  Shield,
  Lock,
  Globe,
  FileText,
} from "lucide-react";
import ProfileSettingsForm from "@/components/admin/ProfileSettingsForm";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import AdminManagement from "@/components/admin/AdminManagement";
import SubscriptionPlanManagement from "@/components/admin/SubscriptionPlanManagement";
import BrandingSettings from "@/components/admin/BrandingSettings";
import { 
  checkIsSuperAdmin,
  getOrganizations,
  getOrganizationById,
  getOrganizationBranding,
  getPlans,
  getOrganizationSubscription,
  getOrganizationLimits
} from "@/services/admin/organizationQueries";
import { supabase } from "@/integrations/supabase/client";

const SuperAdmin = () => {
  const { toast } = useToast();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Check super admin status
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const isAdmin = await checkIsSuperAdmin();
        setIsSuperAdmin(isAdmin);
        
        if (!isAdmin) {
          toast({
            title: "Access denied",
            description: "You don't have super admin privileges",
            variant: "destructive",
          });
        } else {
          loadData();
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };
    
    checkSuperAdmin();
    getCurrentUser();
  }, [toast]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      const orgsData = await getOrganizations();
      setOrganizations(orgsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load super admin data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin</h1>
          <p className="text-muted-foreground">
            Manage organizations, plans, and system settings
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="dashboard">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 w-full">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Organizations
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{organizations.length}</div>
                <p className="text-xs text-muted-foreground">
                  +5 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Subscriptions
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">
                  +58 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  WhatsApp Devices
                </CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+423</div>
                <p className="text-xs text-muted-foreground">
                  +24 from last month
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Event</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{new Date().toLocaleDateString()}</TableCell>
                      <TableCell>Acme Inc</TableCell>
                      <TableCell>Subscription upgraded</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{new Date().toLocaleDateString()}</TableCell>
                      <TableCell>Globex Corp</TableCell>
                      <TableCell>New organization created</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{new Date().toLocaleDateString()}</TableCell>
                      <TableCell>TechFirm LLC</TableCell>
                      <TableCell>Device added</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Building className="mr-2 h-4 w-4" />
                  Add Organization
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Create Plan
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Add Administrator
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-4">
          <div className="flex justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                className="pl-8"
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Organization
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full flex justify-center p-12">
                <p>Loading organizations...</p>
              </div>
            ) : organizations.length === 0 ? (
              <div className="col-span-full flex justify-center p-12">
                <p>No organizations found.</p>
              </div>
            ) : (
              // Placeholder for organizations grid, would be populated from API
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Acme Inc</CardTitle>
                    <CardDescription>
                      acme
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <span className="text-green-600">Active</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Created:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button className="w-full">View Details</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Globex Corp</CardTitle>
                    <CardDescription>
                      globex
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <span className="text-green-600">Active</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Created:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button className="w-full">View Details</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>TechFirm LLC</CardTitle>
                    <CardDescription>
                      techfirm
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <span className="text-green-600">Active</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Created:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button className="w-full">View Details</Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
        
        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <SubscriptionPlanManagement />
        </TabsContent>
        
        {/* Admins Tab */}
        <TabsContent value="admins" className="space-y-4">
          <AdminManagement />
        </TabsContent>
        
        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <BrandingSettings />
        </TabsContent>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettingsForm user={currentUser} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdmin;
