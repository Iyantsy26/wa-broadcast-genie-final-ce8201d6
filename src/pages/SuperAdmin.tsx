
import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Building,
  CreditCard,
  Users,
  Palette,
  Settings,
  User,
  Shield,
  BarChart,
} from "lucide-react";
import ProfileSettingsForm from "@/components/admin/ProfileSettingsForm";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import SubscriptionPlanManagement from "@/components/admin/SubscriptionPlanManagement";
import BrandingSettings from "@/components/admin/BrandingSettings";
import CompactAdminManagement from "@/components/admin/CompactAdminManagement";
import OrganizationManagement from "@/components/admin/OrganizationManagement";
import EnhancedDashboard from "@/components/admin/EnhancedDashboard";
import { supabase } from "@/integrations/supabase/client";
import { getDefaultSuperAdminEmail } from "@/services/auth/authService";
import { useLocation, useNavigate } from "react-router-dom";

interface UserMetadata {
  name: string;
  phone?: string;
  company?: string;
  address?: string;
  bio?: string;
  avatar_url?: string;
}

interface MockUser {
  id: string;
  email: string;
  user_metadata: UserMetadata;
}

const SuperAdmin = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  
  // Extract the tab from URL query params
  const urlParams = new URLSearchParams(location.search);
  const tabFromUrl = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'dashboard');
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/super-admin?tab=${value}`, { replace: true });
  };
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (user && !error) {
            console.log("Found authenticated user:", user);
            
            const isSuperAdminUser = user.user_metadata?.is_super_admin === true;
            
            if (isSuperAdminUser) {
              console.log("User has super admin role in metadata");
              localStorage.setItem('isSuperAdmin', 'true');
              
              const enhancedUser = {
                ...user,
                user_metadata: {
                  ...user.user_metadata,
                  name: user.user_metadata?.name || "Super Admin"
                }
              };
              
              setCurrentUser(enhancedUser as MockUser);
              setIsLoading(false);
              return;
            }
          }
        } catch (userError) {
          console.warn("Error checking authenticated user:", userError);
        }
        
        if (localStorage.getItem('isSuperAdmin') === 'true') {
          console.log("Super admin mode detected from localStorage");
          let mockUser: MockUser = {
            id: 'super-admin',
            email: getDefaultSuperAdminEmail(),
            user_metadata: {
              name: 'Super Admin'
            }
          };
          
          const savedProfile = localStorage.getItem('superAdminProfile');
          if (savedProfile) {
            try {
              const profileData = JSON.parse(savedProfile);
              mockUser = {
                ...mockUser,
                email: profileData.email || mockUser.email,
                user_metadata: {
                  ...mockUser.user_metadata,
                  name: profileData.name || mockUser.user_metadata.name,
                  phone: profileData.phone,
                  company: profileData.company,
                  address: profileData.address,
                  bio: profileData.bio
                }
              };
            } catch (parseError) {
              console.error("Error parsing saved profile:", parseError);
            }
          }
          
          const savedAvatar = localStorage.getItem('superAdminAvatarUrl');
          if (savedAvatar) {
            mockUser.user_metadata.avatar_url = savedAvatar;
          }
          
          setCurrentUser(mockUser);
          
          try {
            console.log("Attempting to sign in with super admin credentials...");
            const { data: { session }, error } = await supabase.auth.signInWithPassword({
              email: mockUser.email,
              password: "super-admin-password"
            });
            
            if (session && !error) {
              console.log("Successfully authenticated with super admin account");
            }
          } catch (signInError) {
            console.warn("Could not sign in with super admin credentials:", signInError);
          }
        } else {
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error) {
            console.error("Error fetching user:", error);
            toast({
              title: "Authentication Error",
              description: "Failed to load user data. Please try signing in again.",
              variant: "destructive",
            });
          } else if (user) {
            console.log("User data loaded successfully:", user);
            setCurrentUser(user as unknown as MockUser);
          } else {
            console.warn("No user found, but no error reported");
            toast({
              title: "Authentication Required",
              description: "Please sign in to access this page.",
              variant: "destructive",
            });
          }
        }
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
    
    loadData();
  }, [toast]);
  
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
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 w-full">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Organizations</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Plans</span>
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admins</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <EnhancedDashboard />
        </TabsContent>
        
        <TabsContent value="organizations" className="space-y-4">
          <OrganizationManagement />
        </TabsContent>
        
        <TabsContent value="plans" className="space-y-4">
          <SubscriptionPlanManagement />
        </TabsContent>
        
        <TabsContent value="admins" className="space-y-4">
          <CompactAdminManagement />
        </TabsContent>
        
        <TabsContent value="branding" className="space-y-4">
          <BrandingSettings />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* System settings would go here */}
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              System settings functionality coming soon
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="profile" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <ProfileSettingsForm user={currentUser as any} />
                <ChangePasswordForm />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdmin;
