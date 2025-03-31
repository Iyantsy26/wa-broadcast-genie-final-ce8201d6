import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  QrCode,
  Smartphone,
  RefreshCw,
  Check,
  X,
  PhoneCall,
  Key,
  AlertCircle,
  MoreVertical,
  Loader2,
  Globe,
  Shield,
  Info,
  Trash2,
  Settings2,
  AlertTriangle,
  Building2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { 
  DeviceAccount,
  getDeviceAccounts,
  addDeviceAccount,
  updateDeviceStatus,
  deleteDeviceAccount,
  checkAccountLimit,
  getUserPlan,
  getAccountLimits
} from '@/services/deviceService';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Progress } from "@/components/ui/progress";

const countryCodes = [
  { code: '+1', country: 'United States' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+86', country: 'China' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+81', country: 'Japan' },
  { code: '+52', country: 'Mexico' },
  { code: '+55', country: 'Brazil' },
];

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
      console.log("Fetched accounts:", fetchedAccounts);
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
      
      console.log("Adding account:", newAccount);
      
      try {
        const addedAccount = await addDeviceAccount(newAccount);
        console.log("Added account:", addedAccount);
        
        setAccounts(prevAccounts => [addedAccount, ...prevAccounts]);
        
        toast({
          title: "Device added",
          description: `Successfully added WhatsApp device.`,
        });
        
        const updatedLimits = await checkAccountLimit();
        setAccountLimit(updatedLimits);
        
        setNewAccountName('');
        setBusinessId('');
        setApiKey('');
        setPhoneNumber('');
        setCountryCode('+1');
        setVerificationCode('');
        setCodeSent(false);
        setVerifying(false);
        setDialogOpen(false);
        
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
    setAccountToDelete(accountId);
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

  const getPlanProgressColor = () => {
    const percentage = (accountLimit.currentCount / accountLimit.limit) * 100;
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getDeviceTypeLabel = (type: string) => {
    switch(type) {
      case 'browser_qr': return 'QR Code';
      case 'browser_web': return 'Web Browser';
      case 'phone_otp': return 'Phone Verification';
      case 'new_business': return 'Business Account';
      case 'business_api': return 'Business API';
      default: return type;
    }
  };

  const getDeviceTypeIcon = (type: string) => {
    switch(type) {
      case 'browser_qr': return <QrCode className="h-4 w-4" />;
      case 'browser_web': return <Globe className="h-4 w-4" />;
      case 'phone_otp': return <PhoneCall className="h-4 w-4" />;
      case 'new_business': return <Building2 className="h-4 w-4" />;
      case 'business_api': return <Key className="h-4 w-4" />;
      default: return <Smartphone className="h-4 w-4" />;
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!accountLimit.canAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add Device
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add WhatsApp Device</DialogTitle>
                <DialogDescription>
                  Choose a method to connect your WhatsApp business account.
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="browser_qr">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="browser_qr">QR Code</TabsTrigger>
                  <TabsTrigger value="phone_otp">Phone</TabsTrigger>
                  <TabsTrigger value="business_api">Business API</TabsTrigger>
                </TabsList>
                
                <TabsContent value="browser_qr" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="qr-name">Device Name</Label>
                    <Input
                      id="qr-name"
                      placeholder="e.g., Marketing Account"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                    />
                  </div>
                  
                  <Alert className="mb-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      In a real implementation, this QR code would be generated by the WhatsApp Business API.
                      Scan it with your WhatsApp app to connect.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="border rounded-md p-6 flex flex-col items-center justify-center">
                    {showQrLoader ? (
                      <div className="flex flex-col items-center justify-center h-32 w-32">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground mt-4">Generating QR code...</p>
                      </div>
                    ) : (
                      <img src={qrCodeUrl} alt="WhatsApp QR Code" className="h-32 w-32" />
                    )}
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      Scan this QR code with your WhatsApp app to connect
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={handleRefreshQrCode}>
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Refresh QR Code
                      </Button>
                      <Button variant="outline" size="sm" onClick={openWebWhatsApp}>
                        <Globe className="mr-2 h-3 w-3" />
                        Open in Browser
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleAddAccount('browser_qr')}
                    disabled={loading || !newAccountName}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Confirm Connection
                      </>
                    )}
                  </Button>
                </TabsContent>
                
                <TabsContent value="phone_otp" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone-name">Device Name</Label>
                    <Input
                      id="phone-name"
                      placeholder="e.g., Support Account"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <div className="flex gap-2">
                      <select
                        className="max-w-[100px] h-10 rounded-md border border-input bg-background px-3 py-2"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.code} ({country.country.substring(0, 2)})
                          </option>
                        ))}
                      </select>
                      <Input
                        id="phone-number"
                        placeholder="123-456-7890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <Alert className="mb-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      In a real implementation, this would send a verification code to your phone via SMS.
                      For demo purposes, you can enter any 6-digit code after requesting it.
                    </AlertDescription>
                  </Alert>
                  
                  {codeSent ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="verification-code">Verification Code</Label>
                        <InputOTP 
                          maxLength={6}
                          value={verificationCode}
                          onChange={(value) => setVerificationCode(value)}
                          className="justify-center"
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                        <p className="text-xs text-muted-foreground mt-2">
                          For demo purposes, any 6-digit code will work.
                        </p>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleVerifyCode}
                        disabled={verifying || !verificationCode || verificationCode.length < 6}
                      >
                        {verifying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Verify Code
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="border rounded-md p-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-500" />
                          <p className="text-sm">
                            We'll send a one-time password to this number to verify.
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={handleSendVerificationCode}
                        disabled={verifying || !phoneNumber || !newAccountName}
                      >
                        {verifying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <PhoneCall className="mr-2 h-4 w-4" />
                            Send Verification Code
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="business_api" className="space-y-4 py-4">
                  <Tabs defaultValue="api_key">
                    <TabsList className="w-full mb-4">
                      <TabsTrigger value="api_key">Direct API</TabsTrigger>
                      <TabsTrigger value="new_business">New Business</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="api_key">
                      <div className="space-y-2">
                        <Label htmlFor="api-name">Device Name</Label>
                        <Input
                          id="api-name"
                          placeholder="e.g., Business Account"
                          value={newAccountName}
                          onChange={(e) => setNewAccountName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="business-id">Business ID</Label>
                        <Input
                          id="business-id"
                          placeholder="Enter Meta Business ID"
                          value={businessId}
                          onChange={(e) => setBusinessId(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="api-key">API Key</Label>
                        <Input
                          id="api-key"
                          type="password"
                          placeholder="Enter API Key"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />
                      </div>
                      
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => handleAddAccount('business_api')}
                        disabled={loading || !newAccountName || !businessId || !apiKey}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Key className="mr-2 h-4 w-4" />
                            Connect API
                          </>
                        )}
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="new_business">
                      <div className="space-y-2">
                        <Label htmlFor="new-business-name">Device Name</Label>
                        <Input
                          id="new-business-name"
                          placeholder="e.g., New Business Account"
                          value={newAccountName}
                          onChange={(e) => setNewAccountName(e.target.value)}
                        />
                      </div>
                      
                      <Alert className="my-4">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          This will guide you through creating a new WhatsApp Business API account with Meta.
                          You'll need a Facebook Business Manager account to proceed.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-2">
                        <Label htmlFor="business-name">Business Name</Label>
                        <Input
                          id="business-name"
                          placeholder="Enter your business name"
                          value={businessId}
                          onChange={(e) => setBusinessId(e.target.value)}
                        />
                      </div>
                      
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => handleAddAccount('new_business')}
                        disabled={loading || !newAccountName || !businessId}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Building2 className="mr-2 h-4 w-4" />
                            Create Business Account
                          </>
                        )}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Device Usage</CardTitle>
          <CardDescription>
            Your current plan: <span className="font-medium">{planFeatures[userPlan].name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Devices used: {accountLimit.currentCount} of {accountLimit.limit}</span>
                <span className="text-sm">{Math.round((accountLimit.currentCount / accountLimit.limit) * 100)}%</span>
              </div>
              <Progress value={(accountLimit.currentCount / accountLimit.limit) * 100} className={`h-2 ${getPlanProgressColor()}`} />
            </div>
            
            {accountLimit.currentCount >= accountLimit.limit && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Plan Limit Reached</AlertTitle>
                <AlertDescription>
                  You've reached the maximum number of devices for your current plan.
                  Upgrade to add more devices.
                </AlertDescription>
              </Alert>
            )}
            
            {accountLimit.currentCount >= accountLimit.limit * 0.8 && accountLimit.currentCount < accountLimit.limit && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You're approaching your plan limit. Consider upgrading soon to add more devices.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Demo Mode</AlertTitle>
        <AlertDescription>
          This is a demonstration of the WhatsApp integration UI. The QR codes and verification processes are simulated.
          In a production environment, these would connect to the actual WhatsApp Business API.
        </AlertDescription>
      </Alert>

      {fetchingAccounts ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Devices Connected</h3>
          <p className="text-center text-muted-foreground mb-4">
            You don't have any connected WhatsApp devices yet. Add your first device to get started.
          </p>
          <Button 
            onClick={() => setDialogOpen(true)}
            disabled={!accountLimit.canAdd}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Device
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{account.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast({ title: "Edit", description: "Feature coming soon" })}>
                        <Settings2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => openDeleteDialog(account.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{account.phone}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        account.status === 'connected'
                          ? 'bg-green-500'
                          : account.status === 'disconnected'
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                      }`}
                    />
                    <span className="text-sm capitalize">{account.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getDeviceTypeIcon(account.type)}
                    <span className="text-sm">{getDeviceTypeLabel(account.type)}</span>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Last active</span>
                    <span>{new Date(account.last_active || account.created_at || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="capitalize">{account.plan_tier || userPlan}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                {account.status !== 'connected' ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleConnect(account.id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Reconnecting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reconnect
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full text-green-600"
                    onClick={() => handleDisconnect(account.id)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Connected
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={webBrowserOpen} onOpenChange={setWebBrowserOpen}>
        <SheetContent className="w-[90%] sm:max-w-[540px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Connect to WhatsApp Web</SheetTitle>
            <SheetDescription>
              Use your WhatsApp Web to connect your account
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 flex flex-col items-center justify-center h-[80vh]">
            <Alert className="mb-4 w-full">
              <Info className="h-4 w-4" />
              <AlertDescription>
                This is a simulation of the WhatsApp Web connection process. In a real implementation, this would load the actual WhatsApp Web interface.
              </AlertDescription>
            </Alert>
            <div className="border rounded p-4 w-full h-full bg-gray-50 flex flex-col items-center justify-center">
              <iframe 
                src="https://web.whatsapp.com" 
                title="WhatsApp Web" 
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Once you scan the QR code on WhatsApp Web, click the button below to complete the connection
            </p>
            <Button 
              className="mt-4" 
              onClick={() => {
                setWebBrowserOpen(false);
                handleAddAccount('browser_web');
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Confirm Connection
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Device</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this device? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Devices;
