
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Building,
  CreditCard,
  Plus,
  Users,
  Palette,
  Smartphone,
  Search,
  Trash,
  Edit,
  Users2,
  Check,
  X,
  BarChart,
  Globe,
  Laptop,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Organization, 
  OrganizationBranding, 
  Plan, 
  OrganizationSubscription,
  DeviceAccount
} from "@/services/devices/deviceTypes";
import { 
  checkIsSuperAdmin,
  getOrganizations,
  getOrganizationById,
  getOrganizationBranding,
  getPlans,
  getOrganizationSubscription,
  getOrganizationLimits
} from "@/services/admin/organizationQueries";
import {
  createOrganization,
  updateOrganization,
  updateOrganizationBranding,
  updateOrganizationSubscription,
  createPlan,
  updatePlan
} from "@/services/admin/organizationMutations";

const SuperAdmin = () => {
  const { toast } = useToast();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showAddOrgDialog, setShowAddOrgDialog] = useState(false);
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [organizationBranding, setOrganizationBranding] = useState<OrganizationBranding | null>(null);
  const [subscription, setSubscription] = useState<OrganizationSubscription | null>(null);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [deviceAccounts, setDeviceAccounts] = useState<DeviceAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showBrandingDialog, setShowBrandingDialog] = useState(false);
  
  // Form states
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDescription, setNewPlanDescription] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("0");
  const [newPlanInterval, setNewPlanInterval] = useState<"monthly" | "yearly">("monthly");
  const [newPlanWhatsAppAccounts, setNewPlanWhatsAppAccounts] = useState("0");
  const [newPlanBroadcasts, setNewPlanBroadcasts] = useState("0");
  const [newPlanTeamMembers, setNewPlanTeamMembers] = useState("0");
  const [newPlanTemplates, setNewPlanTemplates] = useState("0");
  
  // Branding form
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const [customDomain, setCustomDomain] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  
  // Check super admin status
  useEffect(() => {
    const checkSuperAdmin = async () => {
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
    };
    
    checkSuperAdmin();
  }, [toast]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [orgsData, plansData] = await Promise.all([
        getOrganizations(),
        getPlans()
      ]);
      
      setOrganizations(orgsData);
      setPlans(plansData);
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
  
  const loadOrganizationDetails = async (org: Organization) => {
    setSelectedOrganization(org);
    try {
      const [branding, subscription] = await Promise.all([
        getOrganizationBranding(org.id),
        getOrganizationSubscription(org.id)
      ]);
      
      setOrganizationBranding(branding);
      setSubscription(subscription);
      
      // Initialize form state with branding data
      if (branding) {
        setPrimaryColor(branding.primary_color || "#000000");
        setSecondaryColor(branding.secondary_color || "#ffffff");
        setAccentColor(branding.accent_color || "#3b82f6");
        setCustomDomain(branding.custom_domain || "");
        setLogoUrl(branding.logo_url || "");
        setFaviconUrl(branding.favicon_url || "");
      }
    } catch (error) {
      console.error("Error loading organization details:", error);
      toast({
        title: "Error",
        description: "Failed to load organization details",
        variant: "destructive",
      });
    }
  };
  
  const handleAddOrganization = async () => {
    if (!newOrgName || !newOrgSlug) {
      toast({
        title: "Invalid input",
        description: "Please provide both name and slug",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const org = await createOrganization(newOrgName, newOrgSlug);
      if (org) {
        toast({
          title: "Organization created",
          description: `${newOrgName} has been created successfully`,
        });
        setOrganizations([...organizations, org]);
        setNewOrgName("");
        setNewOrgSlug("");
        setShowAddOrgDialog(false);
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      toast({
        title: "Error",
        description: "Failed to create organization",
        variant: "destructive",
      });
    }
  };
  
  const handleAddPlan = async () => {
    try {
      const newPlan: Omit<Plan, 'id'> = {
        name: newPlanName,
        description: newPlanDescription,
        price: parseFloat(newPlanPrice),
        interval: newPlanInterval,
        is_active: true,
        is_custom: false,
        features: {
          whatsapp_accounts: parseInt(newPlanWhatsAppAccounts, 10),
          broadcasts_per_month: parseInt(newPlanBroadcasts, 10),
          team_members: parseInt(newPlanTeamMembers, 10),
          templates: parseInt(newPlanTemplates, 10)
        }
      };
      
      const plan = await createPlan(newPlan);
      if (plan) {
        toast({
          title: "Plan created",
          description: `${newPlanName} plan has been created successfully`,
        });
        setPlans([...plans, plan]);
        resetPlanForm();
        setShowAddPlanDialog(false);
      }
    } catch (error) {
      console.error("Error creating plan:", error);
      toast({
        title: "Error",
        description: "Failed to create plan",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;
    
    try {
      const updatedPlan: Partial<Plan> = {
        name: newPlanName,
        description: newPlanDescription,
        price: parseFloat(newPlanPrice),
        interval: newPlanInterval,
        features: {
          whatsapp_accounts: parseInt(newPlanWhatsAppAccounts, 10),
          broadcasts_per_month: parseInt(newPlanBroadcasts, 10),
          team_members: parseInt(newPlanTeamMembers, 10),
          templates: parseInt(newPlanTemplates, 10)
        }
      };
      
      const success = await updatePlan(selectedPlan.id, updatedPlan);
      if (success) {
        toast({
          title: "Plan updated",
          description: `${newPlanName} plan has been updated successfully`,
        });
        
        // Update plan in state
        const updatedPlans = plans.map(p => 
          p.id === selectedPlan.id 
            ? { ...p, ...updatedPlan } 
            : p
        );
        
        setPlans(updatedPlans);
        resetPlanForm();
        setShowAddPlanDialog(false);
        setIsEditingPlan(false);
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: "Error",
        description: "Failed to update plan",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateSubscription = async (planId: string) => {
    if (!selectedOrganization) return;
    
    try {
      const success = await updateOrganizationSubscription(
        selectedOrganization.id,
        planId
      );
      
      if (success) {
        toast({
          title: "Subscription updated",
          description: "The organization's subscription has been updated",
        });
        
        // Refresh subscription data
        const updatedSubscription = await getOrganizationSubscription(selectedOrganization.id);
        setSubscription(updatedSubscription);
        setShowPlanDialog(false);
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateBranding = async () => {
    if (!selectedOrganization) return;
    
    try {
      const brandingData: Partial<OrganizationBranding> = {
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        custom_domain: customDomain,
        logo_url: logoUrl,
        favicon_url: faviconUrl
      };
      
      const updatedBranding = await updateOrganizationBranding(
        selectedOrganization.id,
        brandingData
      );
      
      if (updatedBranding) {
        toast({
          title: "Branding updated",
          description: "The organization's branding has been updated",
        });
        
        setOrganizationBranding(updatedBranding);
        setShowBrandingDialog(false);
      }
    } catch (error) {
      console.error("Error updating branding:", error);
      toast({
        title: "Error",
        description: "Failed to update branding",
        variant: "destructive",
      });
    }
  };
  
  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setNewPlanName(plan.name);
    setNewPlanDescription(plan.description || "");
    setNewPlanPrice(plan.price?.toString() || "0");
    setNewPlanInterval(plan.interval || "monthly");
    setNewPlanWhatsAppAccounts(plan.features.whatsapp_accounts?.toString() || "0");
    setNewPlanBroadcasts(plan.features.broadcasts_per_month?.toString() || "0");
    setNewPlanTeamMembers(plan.features.team_members?.toString() || "0");
    setNewPlanTemplates(plan.features.templates?.toString() || "0");
    setIsEditingPlan(true);
    setShowAddPlanDialog(true);
  };
  
  const resetPlanForm = () => {
    setNewPlanName("");
    setNewPlanDescription("");
    setNewPlanPrice("0");
    setNewPlanInterval("monthly");
    setNewPlanWhatsAppAccounts("0");
    setNewPlanBroadcasts("0");
    setNewPlanTeamMembers("0");
    setNewPlanTemplates("0");
    setSelectedPlan(null);
  };
  
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }
  
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
      
      <Tabs defaultValue="organizations">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-4">
          <div className="flex justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowAddOrgDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Organization
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {selectedOrganization ? (
              <div className="md:col-span-1 space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedOrganization(null)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Close Details
                </Button>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedOrganization.name}</CardTitle>
                    <CardDescription>
                      Slug: {selectedOrganization.slug}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span className="font-medium">
                          {selectedOrganization.is_active ? (
                            <span className="text-green-600 flex items-center">
                              <Check className="mr-1 h-4 w-4" />
                              Active
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center">
                              <X className="mr-1 h-4 w-4" />
                              Inactive
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Created</span>
                        <span className="font-medium">
                          {new Date(selectedOrganization.created_at || "").toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setShowPlanDialog(true)}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        {subscription?.plan?.name || "No Plan"}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setShowBrandingDialog(true)}
                      >
                        <Palette className="mr-2 h-4 w-4" />
                        Branding Settings
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Users2 className="mr-2 h-4 w-4" />
                        Team Members
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Smartphone className="mr-2 h-4 w-4" />
                        WhatsApp Devices
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <BarChart className="mr-2 h-4 w-4" />
                        Usage Stats
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
            
            <div className={`${selectedOrganization ? 'md:col-span-2' : 'md:col-span-3'} grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
              {isLoading ? (
                <div className="col-span-full flex justify-center p-12">
                  <p>Loading organizations...</p>
                </div>
              ) : filteredOrganizations.length === 0 ? (
                <div className="col-span-full flex justify-center p-12">
                  <p>No organizations found.</p>
                </div>
              ) : (
                filteredOrganizations.map((org) => (
                  <Card 
                    key={org.id} 
                    className={`${selectedOrganization?.id === org.id ? 'ring-2 ring-primary' : ''}`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle>{org.name}</CardTitle>
                      <CardDescription>
                        {org.slug}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Status:</span>
                          <span 
                            className={org.is_active ? "text-green-600" : "text-red-600"}
                          >
                            {org.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Created:</span>
                          <span>
                            {new Date(org.created_at || "").toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => loadOrganizationDetails(org)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => {
              resetPlanForm();
              setIsEditingPlan(false);
              setShowAddPlanDialog(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Plan
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full flex justify-center p-12">
                <p>Loading plans...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="col-span-full flex justify-center p-12">
                <p>No plans found.</p>
              </div>
            ) : (
              plans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>
                          {plan.description}
                        </CardDescription>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => handleEditPlan(plan)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-3xl font-bold">
                          ${plan.price || 0}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /{plan.interval || 'month'}
                        </span>
                      </div>
                      
                      <div className="space-y-1 pt-3">
                        <div className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>
                            {plan.features.whatsapp_accounts || 0} WhatsApp Accounts
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>
                            {plan.features.broadcasts_per_month || 0} Broadcasts/month
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>
                            {plan.features.team_members || 0} Team Members
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>
                            {plan.features.templates || 0} Templates
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure global system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultPlan">Default Plan</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select default plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="trialDays">Trial Period (Days)</Label>
                    <Input type="number" defaultValue={14} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Organization Dialog */}
      <Dialog open={showAddOrgDialog} onOpenChange={setShowAddOrgDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                placeholder="Acme Inc."
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgSlug">Slug</Label>
              <Input
                id="orgSlug"
                placeholder="acme"
                value={newOrgSlug}
                onChange={(e) => setNewOrgSlug(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This will be used in URLs and subdomains
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddOrgDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOrganization}>
              Create Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add/Edit Plan Dialog */}
      <Dialog open={showAddPlanDialog} onOpenChange={setShowAddPlanDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditingPlan ? "Edit Plan" : "Create New Plan"}
            </DialogTitle>
            <DialogDescription>
              {isEditingPlan 
                ? "Modify the selected plan details" 
                : "Define a new subscription plan"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="planName">Plan Name</Label>
              <Input
                id="planName"
                placeholder="Professional"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planDescription">Description</Label>
              <Input
                id="planDescription"
                placeholder="For growing businesses"
                value={newPlanDescription}
                onChange={(e) => setNewPlanDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planPrice">Price</Label>
                <Input
                  id="planPrice"
                  type="number"
                  placeholder="79.99"
                  value={newPlanPrice}
                  onChange={(e) => setNewPlanPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planInterval">Billing Interval</Label>
                <Select 
                  value={newPlanInterval} 
                  onValueChange={(value: "monthly" | "yearly") => setNewPlanInterval(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsappAccounts">WhatsApp Accounts</Label>
                  <Input
                    id="whatsappAccounts"
                    type="number"
                    value={newPlanWhatsAppAccounts}
                    onChange={(e) => setNewPlanWhatsAppAccounts(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="broadcasts">Broadcasts/month</Label>
                  <Input
                    id="broadcasts"
                    type="number"
                    value={newPlanBroadcasts}
                    onChange={(e) => setNewPlanBroadcasts(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamMembers">Team Members</Label>
                  <Input
                    id="teamMembers"
                    type="number"
                    value={newPlanTeamMembers}
                    onChange={(e) => setNewPlanTeamMembers(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="templates">Templates</Label>
                  <Input
                    id="templates"
                    type="number"
                    value={newPlanTemplates}
                    onChange={(e) => setNewPlanTemplates(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddPlanDialog(false);
                if (isEditingPlan) {
                  setIsEditingPlan(false);
                  resetPlanForm();
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={isEditingPlan ? handleUpdatePlan : handleAddPlan}
            >
              {isEditingPlan ? "Update Plan" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Plan Selection Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Select a plan for {selectedOrganization?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto py-4">
            <div className="space-y-4">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`p-4 border rounded-md cursor-pointer hover:border-primary transition-colors ${subscription?.plan_id === plan.id ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => handleUpdateSubscription(plan.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${plan.price}</div>
                      <div className="text-xs text-muted-foreground">
                        per {plan.interval}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      {plan.features.whatsapp_accounts} accounts
                    </div>
                    <div className="flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      {plan.features.broadcasts_per_month} broadcasts
                    </div>
                    <div className="flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      {plan.features.team_members} team members
                    </div>
                    <div className="flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      {plan.features.templates} templates
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Branding Dialog */}
      <Dialog open={showBrandingDialog} onOpenChange={setShowBrandingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Branding Settings</DialogTitle>
            <DialogDescription>
              Customize branding for {selectedOrganization?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex space-x-2">
                <div 
                  className="w-8 h-8 border rounded"
                  style={{ backgroundColor: primaryColor }}
                />
                <Input
                  id="primaryColor"
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex space-x-2">
                <div 
                  className="w-8 h-8 border rounded"
                  style={{ backgroundColor: secondaryColor }}
                />
                <Input
                  id="secondaryColor"
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex space-x-2">
                <div 
                  className="w-8 h-8 border rounded"
                  style={{ backgroundColor: accentColor }}
                />
                <Input
                  id="accentColor"
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customDomain">Custom Domain</Label>
              <Input
                id="customDomain"
                type="text"
                placeholder="app.yourcompany.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                type="text"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faviconUrl">Favicon URL</Label>
              <Input
                id="faviconUrl"
                type="text"
                placeholder="https://example.com/favicon.ico"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBrandingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBranding}>
              Save Branding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdmin;
