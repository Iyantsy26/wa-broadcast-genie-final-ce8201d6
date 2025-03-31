import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  DeviceAccount,
  getDeviceAccounts,
  addDeviceAccount,
  updateDeviceStatus,
  deleteDeviceAccount,
  checkAccountLimit,
  getUserPlan,
  updateDeviceAccount
} from '@/services/deviceService';

// Import components
import DeviceList from '@/components/devices/DeviceList';
import DeviceUsageCard from '@/components/devices/DeviceUsageCard';
import AddDeviceDialog from '@/components/devices/AddDeviceDialog';
import DeleteDeviceDialog from '@/components/devices/DeleteDeviceDialog';
import EditDeviceDialog from '@/components/devices/EditDeviceDialog';
import WebWhatsAppSheet from '@/components/devices/WebWhatsAppSheet';
import DemoAlert from '@/components/devices/DemoAlert';

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
  const [businessId, setBusinessId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQrLoader, setShowQrLoader] = useState(true);
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
  }, []);

  const fetchUserPlanInfo = async () => {
    try {
      const plan = await getUserPlan();
      setUserPlan(plan);
      
      const limits = await checkAccountLimit();
      setAccountLimit(limits);
    } catch (error) {
      console.error("Error fetching user plan info:", error);
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

  const generateQrCode = () => {
    setShowQrLoader(true);
    setTimeout(() => {
      const uniqueId = new Date().getTime();
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp-connect-${uniqueId}`);
      setShowQrLoader(false);
    }, 1500);
  };

  const handleConnect = async (accountId: string) => {
    try {
      setLoading(true);
      await updateDeviceStatus(accountId, 'connected');
      
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => 
          acc.id === accountId ? { ...acc, status: 'connected' } : acc
        )
      );
      
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
      
      if (type === 'phone_otp') {
        if (!phoneNumber) {
          toast({
            title: "Missing information",
            description: "Please provide a phone number.",
            variant: "destructive",
          });
          return;
        }
        
        if (codeSent && !verificationCode) {
          toast({
            title: "Missing verification code",
            description: "Please enter the verification code sent to your phone.",
            variant: "destructive",
          });
          return;
        }
      }
      
      if (type === 'business_api' && (!businessId || !apiKey)) {
        toast({
          title: "Missing information",
          description: "Please provide both business ID and API key.",
          variant: "destructive",
        });
        return;
      }
      
      const newAccount: Omit<DeviceAccount, 'id'> = {
        name: newAccountName,
        phone: type === 'phone_otp' ? `${countryCode} ${phoneNumber}` : 'Business Account',
        status: 'connected',
        type: type,
        last_active: new Date().toISOString(),
        business_id: type === 'business_api' || type === 'new_business' ? businessId : undefined,
        plan_tier: userPlan,
      };
      
      try {
        const addedAccount = await addDeviceAccount(newAccount);
        
        setAccounts(prevAccounts => [addedAccount, ...prevAccounts]);
        
        toast({
          title: "Device added",
          description: `Successfully added WhatsApp device.`,
        });
        
        const updatedLimits = await checkAccountLimit();
        setAccountLimit(updatedLimits);
        
        resetFormFields();
        
        if (type === 'browser_qr') {
          generateQrCode();
        }
      } catch (error: any) {
        console.error("Error adding account:", error);
        let errorMessage = "Failed to add WhatsApp device";
        
        if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
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

  const resetFormFields = () => {
    setNewAccountName('');
    setBusinessId('');
    setApiKey('');
    setPhoneNumber('');
    setCountryCode('+1');
    setVerificationCode('');
    setCodeSent(false);
    setVerifying(false);
    setDialogOpen(false);
  };

  const handleSendVerificationCode = () => {
    if (!phoneNumber) {
      toast({
        title: "Missing phone number",
        description: "Please enter a valid phone number to receive the verification code.",
        variant: "destructive",
      });
      return;
    }
    
    setVerifying(true);
    
    setTimeout(() => {
      setVerifying(false);
      setCodeSent(true);
      toast({
        title: "Verification code sent",
        description: `A verification code has been sent to ${countryCode} ${phoneNumber}. For demo purposes, you can enter any 6-digit code.`,
      });
    }, 1500);
  };

  const handleVerifyCode = () => {
    if (!verificationCode) {
      toast({
        title: "Missing verification code",
        description: "Please enter the verification code you received.",
        variant: "destructive",
      });
      return;
    }
    
    setVerifying(true);
    
    setTimeout(() => {
      setVerifying(false);
      handleAddAccount('phone_otp');
    }, 1500);
  };

  const handleRefreshQrCode = () => {
    setShowQrLoader(true);
    setQrCodeUrl('');
    generateQrCode();
  };

  const openWebWhatsApp = () => {
    setWebBrowserOpen(true);
  };

  const handleDisconnect = async (accountId: string) => {
    try {
      await updateDeviceStatus(accountId, 'disconnected');
      
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => 
          acc.id === accountId ? { ...acc, status: 'disconnected' } : acc
        )
      );
      
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
        setAccounts(prevAccounts => 
          prevAccounts.filter(acc => acc.id !== accountToDelete)
        );
        
        toast({
          title: "Device removed",
          description: "Successfully removed WhatsApp device.",
        });
        
        const updatedLimits = await checkAccountLimit();
        setAccountLimit(updatedLimits);
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
        setAccounts(prevAccounts => 
          prevAccounts.map(acc => 
            acc.id === id ? { ...acc, ...updates } : acc
          )
        );
        
        toast({
          title: "Device updated",
          description: "Successfully updated WhatsApp device.",
        });
        
        setEditDialogOpen(false);
        setDeviceToEdit(null);
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
          <AddDeviceDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onAddAccount={handleAddAccount}
            canAddDevices={accountLimit.canAdd}
            loading={loading}
            newAccountName={newAccountName}
            setNewAccountName={setNewAccountName}
            businessId={businessId}
            setBusinessId={setBusinessId}
            apiKey={apiKey}
            setApiKey={setApiKey}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            codeSent={codeSent}
            setCodeSent={setCodeSent}
            verifying={verifying}
            setVerifying={setVerifying}
            onSendVerificationCode={handleSendVerificationCode}
            onVerifyCode={handleVerifyCode}
            generateQrCode={generateQrCode}
            handleRefreshQrCode={handleRefreshQrCode}
            openWebWhatsApp={openWebWhatsApp}
            qrCodeUrl={qrCodeUrl}
            showQrLoader={showQrLoader}
          />
        </div>
      </div>

      <DeviceUsageCard 
        userPlan={userPlan}
        accountLimit={accountLimit}
        planFeatures={planFeatures}
      />

      <DemoAlert />

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
