
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  DeviceAccount,
  getDeviceAccounts,
  addDeviceAccount,
  updateDeviceStatus,
  deleteDeviceAccount,
  checkAccountLimit,
  getUserPlan,
  updateDeviceAccount,
  subscribeToDeviceChanges,
  upgradePlan,
  getAccountLimits // Make sure this is imported
} from '@/services/deviceService';

// Import components
import DeviceList from '@/components/devices/DeviceList';
import DeviceUsageCard from '@/components/devices/DeviceUsageCard';
import AddDeviceDialog from '@/components/devices/AddDeviceDialog';
import DeleteDeviceDialog from '@/components/devices/DeleteDeviceDialog';
import EditDeviceDialog from '@/components/devices/EditDeviceDialog';
import WebWhatsAppSheet from '@/components/devices/WebWhatsAppSheet';
import DeviceGuideDialog from '@/components/devices/DeviceGuideDialog';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import SuperAdminSmsVerification from '@/components/admin/SuperAdminSmsVerification';

// Plan configuration
const planFeatures = {
  starter: {
    name: "Starter",
    devices: 2,
    color: "bg-blue-500"
  },
  professional: {
    name: "Professional",
    devices: 10,
    color: "bg-purple-500"
  },
  enterprise: {
    name: "Enterprise",
    devices: 20,
    color: "bg-green-500"
  }
};

const Devices = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<DeviceAccount[]>([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [webBrowserOpen, setWebBrowserOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<'starter' | 'professional' | 'enterprise'>('starter');
  const [accountLimit, setAccountLimit] = useState({ canAdd: true, currentCount: 0, limit: 2 });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState<DeviceAccount | null>(null);
  const [deleteDeviceName, setDeleteDeviceName] = useState('this device');
  const [isAdmin, setIsAdmin] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState(false);
  const [targetPlan, setTargetPlan] = useState<'professional' | 'enterprise'>('professional');
  const [upgradeSuccessful, setUpgradeSuccessful] = useState(false);

  useEffect(() => {
    fetchDeviceAccounts();
    fetchUserPlanInfo();
    checkAdminStatus();

    // Set up real-time listener for device account changes
    const cleanup = subscribeToDeviceChanges((payload) => {
      console.log('Real-time update received:', payload);
      fetchDeviceAccounts();
    });

    return cleanup;
  }, []);

  const checkAdminStatus = async () => {
    try {
      // Try to get the user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAdmin(false);
        return;
      }
      
      // Check if user has admin role
      const { data, error } = await supabase
        .from('team_members')
        .select('role, is_super_admin')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else if (data) {
        setIsAdmin(data.role === 'admin' || data.role === 'super_admin' || data.is_super_admin === true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setIsAdmin(false);
    }
  };

  const fetchUserPlanInfo = async () => {
    try {
      // Default to starter plan if there's an error
      let plan: 'starter' | 'professional' | 'enterprise';
      try {
        plan = await getUserPlan();
      } catch (error) {
        console.error("Error fetching user plan info:", error);
        plan = 'starter';
      }
      setUserPlan(plan);
      
      let limits = { canAdd: true, currentCount: 0, limit: getAccountLimits(plan) };
      try {
        limits = await checkAccountLimit();
      } catch (error) {
        console.error("Error checking account limits:", error);
      }
      setAccountLimit(limits);
    } catch (error) {
      console.error("Error fetching user plan info:", error);
      toast({
        title: "Error",
        description: "Failed to fetch plan information",
        variant: "destructive",
      });
    }
  };

  const fetchDeviceAccounts = async () => {
    try {
      setFetchingAccounts(true);
      const fetchedAccounts = await getDeviceAccounts();
      setAccounts(fetchedAccounts);
      
      const limits = await checkAccountLimit();
      setAccountLimit(limits);
    } catch (error) {
      console.error("Error fetching device accounts:", error);
      toast({
        title: "Error",
        description: "Failed to load device accounts",
        variant: "destructive",
      });
    } finally {
      setFetchingAccounts(false);
    }
  };

  const handleConnect = async (accountId: string) => {
    try {
      setLoading(true);
      // Add a delay to prevent UI freezing
      await new Promise(resolve => setTimeout(resolve, 500));
      await updateDeviceStatus(accountId, 'connected');
      toast({
        title: "Device reconnected",
        description: "Successfully reconnected WhatsApp device.",
      });
    } catch (error) {
      console.error("Error reconnecting device:", error);
      toast({
        title: "Error",
        description: "Failed to reconnect WhatsApp device",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (type: 'browser_qr' | 'browser_web' | 'phone_otp' | 'business_api') => {
    try {
      setLoading(true);
      
      const { canAdd, currentCount, limit } = await checkAccountLimit();
      
      if (!canAdd) {
        setUpgradeDialogOpen(true);
        return;
      }
      
      if (!newAccountName) {
        toast({
          title: "Missing information",
          description: "Please provide an account name.",
          variant: "destructive",
        });
        return;
      }
      
      // Note: Most of the actual device creation is now handled in the AddDeviceDialog component
      // This function is now primarily for finalizing the account after connection
      
      toast({
        title: "Device added",
        description: `Successfully added WhatsApp device.`,
      });
      
      // Refresh devices list and limits after adding
      fetchDeviceAccounts();
      
      // Reset form state
      setNewAccountName('');
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error in handleAddAccount:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    try {
      // Add a delay to prevent UI freezing
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      await updateDeviceStatus(accountId, 'disconnected');
      toast({
        title: "Device disconnected",
        description: "Successfully disconnected WhatsApp device.",
      });
    } catch (error) {
      console.error("Error disconnecting device:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect WhatsApp device",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (accountId: string) => {
    const device = accounts.find(acc => acc.id === accountId);
    setAccountToDelete(accountId);
    setDeleteDeviceName(device?.name || 'this device');
    setDeleteDialogOpen(true);
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;
    
    try {
      setLoading(true);
      // Add a delay to prevent UI freezing
      await new Promise(resolve => setTimeout(resolve, 500));
      const success = await deleteDeviceAccount(accountToDelete);
      
      if (success) {
        toast({
          title: "Device removed",
          description: "Successfully removed WhatsApp device.",
        });
        
        // Force a refresh in case the real-time listener doesn't catch it
        setTimeout(() => {
          fetchDeviceAccounts();
        }, 500);
      } else {
        toast({
          title: "Error",
          description: "Failed to remove WhatsApp device. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting device:", error);
      toast({
        title: "Error",
        description: "Failed to remove WhatsApp device",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const openEditDialog = (device: DeviceAccount) => {
    setDeviceToEdit(device);
    setEditDialogOpen(true);
  };

  const handleEditAccount = async (id: string, updates: Partial<DeviceAccount>) => {
    try {
      setLoading(true);
      // Add a delay to prevent UI freezing
      await new Promise(resolve => setTimeout(resolve, 500));
      const success = await updateDeviceAccount(id, updates);
      
      if (success) {
        toast({
          title: "Device updated",
          description: "Successfully updated WhatsApp device.",
        });
        
        setEditDialogOpen(false);
        setDeviceToEdit(null);
        
        // Force refresh to ensure UI is updated
        fetchDeviceAccounts();
      } else {
        toast({
          title: "Error",
          description: "Failed to update WhatsApp device. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating device:", error);
      toast({
        title: "Error",
        description: "Failed to update WhatsApp device",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWebWhatsAppConfirm = () => {
    setWebBrowserOpen(false);
    handleAddAccount('browser_web');
  };

  const handleUpgradePlan = async () => {
    setUpgradingPlan(true);
    try {
      const result = await upgradePlan(targetPlan);
      if (result) {
        setUpgradeSuccessful(true);
        fetchUserPlanInfo();
        toast({
          title: "Plan upgraded",
          description: `Your plan has been successfully upgraded to ${planFeatures[targetPlan].name}.`,
        });
      } else {
        toast({
          title: "Upgrade failed",
          description: "Failed to upgrade your plan. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error upgrading plan:", error);
      toast({
        title: "Error",
        description: "An error occurred while upgrading your plan",
        variant: "destructive",
      });
    } finally {
      setUpgradingPlan(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
          <p className="text-muted-foreground">
            Manage your connected WhatsApp business devices
          </p>
        </div>
        
        <div className="flex gap-2">
          <DeviceGuideDialog />
          
          {isAdmin && (
            <SuperAdminSmsVerification />
          )}
          
          <AddDeviceDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onAddAccount={handleAddAccount}
            canAddDevices={accountLimit.canAdd}
            loading={loading}
            setLoading={setLoading}
            newAccountName={newAccountName}
            setNewAccountName={setNewAccountName}
            refreshDevices={fetchDeviceAccounts}
          />
        </div>
      </div>

      <DeviceUsageCard 
        userPlan={userPlan}
        accountLimit={accountLimit}
        planFeatures={planFeatures}
        onUpgrade={() => setUpgradeDialogOpen(true)}
      />

      <DeviceList
        accounts={accounts}
        loading={loading}
        fetchingAccounts={fetchingAccounts}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onDelete={openDeleteDialog}
        onEdit={openEditDialog}
        onOpenAddDialog={() => setDialogOpen(true)}
        canAddDevices={accountLimit.canAdd}
      />

      <WebWhatsAppSheet
        open={webBrowserOpen}
        onOpenChange={setWebBrowserOpen}
        onConfirm={handleWebWhatsAppConfirm}
      />

      <DeleteDeviceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDeleteAccount}
        loading={loading}
        deviceName={deleteDeviceName}
      />

      <EditDeviceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleEditAccount}
        loading={loading}
        device={deviceToEdit}
      />

      {/* Plan Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              {upgradeSuccessful 
                ? "Your plan has been successfully upgraded!"
                : "Upgrade to a higher plan to add more WhatsApp devices."
              }
            </DialogDescription>
          </DialogHeader>
          
          {!upgradeSuccessful ? (
            <>
              <div className="grid gap-4 py-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <div 
                      className={`border rounded-lg p-4 flex-1 cursor-pointer ${
                        targetPlan === 'professional' 
                          ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' 
                          : 'hover:border-purple-200'
                      }`}
                      onClick={() => setTargetPlan('professional')}
                    >
                      <h3 className="font-medium text-center">Professional</h3>
                      <p className="text-2xl font-bold text-center mt-2">
                        $29<span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </p>
                      <div className="text-center mt-2 text-sm">Up to 10 devices</div>
                    </div>
                    
                    <div 
                      className={`border rounded-lg p-4 flex-1 cursor-pointer ${
                        targetPlan === 'enterprise' 
                          ? 'border-green-500 bg-green-50 ring-1 ring-green-500' 
                          : 'hover:border-green-200'
                      }`}
                      onClick={() => setTargetPlan('enterprise')}
                    >
                      <h3 className="font-medium text-center">Enterprise</h3>
                      <p className="text-2xl font-bold text-center mt-2">
                        $49<span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </p>
                      <div className="text-center mt-2 text-sm">Up to 20 devices</div>
                    </div>
                  </div>
                  
                  <div className="rounded-md bg-amber-50 p-4 border border-amber-100">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <div className="text-sm text-amber-800">
                        For demo purposes, the plan upgrade is simulated and no actual payment will be processed.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setUpgradeDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpgradePlan}
                  disabled={upgradingPlan}
                >
                  {upgradingPlan ? 'Processing...' : `Upgrade to ${planFeatures[targetPlan].name}`}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="rounded-full bg-green-100 p-3 mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-green-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Upgraded to {planFeatures[targetPlan].name}
                </h3>
                <p className="text-center text-muted-foreground">
                  You can now add up to {planFeatures[targetPlan].devices} WhatsApp devices.
                </p>
              </div>
              
              <DialogFooter>
                <Button
                  onClick={() => {
                    setUpgradeDialogOpen(false);
                    setUpgradeSuccessful(false);
                    setDialogOpen(true);
                  }}
                >
                  Add Device
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Devices;
