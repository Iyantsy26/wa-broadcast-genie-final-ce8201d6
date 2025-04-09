
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  DeviceAccount,
  getDeviceAccounts,
  addDeviceAccount,
  updateDeviceStatus,
  deleteDeviceAccount,
  checkAccountLimit,
  getUserPlan,
  updateDeviceAccount,
  subscribeToDeviceChanges
} from '@/services/deviceService';

// Import components
import DeviceList from '@/components/devices/DeviceList';
import DeviceUsageCard from '@/components/devices/DeviceUsageCard';
import AddDeviceDialog from '@/components/devices/AddDeviceDialog';
import DeleteDeviceDialog from '@/components/devices/DeleteDeviceDialog';
import EditDeviceDialog from '@/components/devices/EditDeviceDialog';
import WebWhatsAppSheet from '@/components/devices/WebWhatsAppSheet';
import DeviceGuideDialog from '@/components/devices/DeviceGuideDialog';

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

  useEffect(() => {
    fetchDeviceAccounts();
    fetchUserPlanInfo();

    // Set up real-time listener for device account changes
    const cleanup = subscribeToDeviceChanges((payload) => {
      console.log('Real-time update received:', payload);
      fetchDeviceAccounts();
    });

    return cleanup;
  }, []);

  const fetchUserPlanInfo = async () => {
    try {
      const plan = await getUserPlan();
      setUserPlan(plan);
      
      const limits = await checkAccountLimit();
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

  const handleAddAccount = async (type: 'browser_qr' | 'browser_web' | 'phone_otp' | 'new_business' | 'business_api') => {
    try {
      setLoading(true);
      
      const { canAdd, currentCount, limit } = await checkAccountLimit();
      
      if (!canAdd) {
        toast({
          title: "Plan limit reached",
          description: `You can only connect ${limit} devices on your current plan. Please upgrade to add more.`,
          variant: "destructive",
        });
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
      const success = await deleteDeviceAccount(accountToDelete);
      
      if (success) {
        toast({
          title: "Device removed",
          description: "Successfully removed WhatsApp device.",
        });
        
        // No need to manually update the accounts list, the real-time listener will handle it
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
      const success = await updateDeviceAccount(id, updates);
      
      if (success) {
        toast({
          title: "Device updated",
          description: "Successfully updated WhatsApp device.",
        });
        
        setEditDialogOpen(false);
        setDeviceToEdit(null);
        
        // No need to manually update the accounts list, the real-time listener will handle it
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
    </div>
  );
};

export default Devices;
