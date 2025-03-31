
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { getWhatsAppAccounts, addWhatsAppAccount, updateWhatsAppAccountStatus, WhatsAppAccount } from '@/services/whatsAppService';

// Array of country codes for the phone tab
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

const WhatsAppAccounts = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
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

  // Fetch WhatsApp accounts on initial load
  useEffect(() => {
    fetchWhatsAppAccounts();
  }, []);

  const fetchWhatsAppAccounts = async () => {
    try {
      setFetchingAccounts(true);
      const fetchedAccounts = await getWhatsAppAccounts();
      setAccounts(fetchedAccounts);
    } catch (error) {
      console.error("Error fetching WhatsApp accounts:", error);
      toast({
        title: "Error",
        description: "Failed to load WhatsApp accounts",
        variant: "destructive",
      });
    } finally {
      setFetchingAccounts(false);
    }
  };

  // Generate QR code on dialog open
  useEffect(() => {
    if (dialogOpen) {
      generateQrCode();
    }
  }, [dialogOpen]);

  // Mock function to simulate QR code generation
  const generateQrCode = () => {
    setShowQrLoader(true);
    setTimeout(() => {
      // In a real app, this would be a real QR code URL from WhatsApp API
      setQrCodeUrl('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp://connection/example');
      setShowQrLoader(false);
    }, 1500);
  };

  const handleConnect = async (accountId: string) => {
    try {
      setLoading(true);
      await updateWhatsAppAccountStatus(accountId, 'connected');
      
      // Update the local state
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => 
          acc.id === accountId ? { ...acc, status: 'connected' } : acc
        )
      );
      
      toast({
        title: "Account reconnected",
        description: "Successfully reconnected WhatsApp account.",
      });
    } catch (error) {
      console.error("Error reconnecting account:", error);
      toast({
        title: "Error",
        description: "Failed to reconnect WhatsApp account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (type: string) => {
    try {
      setLoading(true);
      
      // Validate inputs based on connection type
      if (type === 'QR code' && !newAccountName) {
        toast({
          title: "Missing information",
          description: "Please provide an account name.",
          variant: "destructive",
        });
        return;
      }
      
      if (type === 'phone verification') {
        if (!newAccountName || !phoneNumber) {
          toast({
            title: "Missing information",
            description: "Please provide both account name and phone number.",
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
      
      if (type === 'Business API') {
        if (!newAccountName || !businessId || !apiKey) {
          toast({
            title: "Missing information",
            description: "Please provide account name, business ID, and API key.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Create the account object based on type
      const newAccount: Omit<WhatsAppAccount, 'id'> = {
        name: newAccountName,
        phone: type === 'phone verification' ? `${countryCode} ${phoneNumber}` : 'Business Account',
        status: 'connected',
        type: type === 'QR code' ? 'qr' : type === 'phone verification' ? 'otp' : 'api',
        last_active: new Date().toISOString(),
        business_id: type === 'Business API' ? businessId : undefined,
      };
      
      // Add the account to the database
      const addedAccount = await addWhatsAppAccount(newAccount);
      
      // Update the local state
      setAccounts(prevAccounts => [addedAccount, ...prevAccounts]);
      
      toast({
        title: "Account added",
        description: `Successfully added WhatsApp account via ${type}.`,
      });
      
      // Reset form state
      setNewAccountName('');
      setBusinessId('');
      setApiKey('');
      setPhoneNumber('');
      setCountryCode('+1');
      setVerificationCode('');
      setCodeSent(false);
      setVerifying(false);
      setDialogOpen(false);
      
      // Force refresh QR code if that method was used
      if (type === 'QR code') {
        generateQrCode();
      }
    } catch (error) {
      console.error("Error adding account:", error);
      toast({
        title: "Error",
        description: "Failed to add WhatsApp account",
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
    
    // Simulate sending verification code
    setTimeout(() => {
      setVerifying(false);
      setCodeSent(true);
      toast({
        title: "Verification code sent",
        description: `A verification code has been sent to ${countryCode} ${phoneNumber}.`,
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
    
    // Simulate verifying code
    setTimeout(() => {
      setVerifying(false);
      handleAddAccount('phone verification');
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
      await updateWhatsAppAccountStatus(accountId, 'disconnected');
      
      // Update the local state
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => 
          acc.id === accountId ? { ...acc, status: 'disconnected' } : acc
        )
      );
      
      toast({
        title: "Account disconnected",
        description: "Successfully disconnected WhatsApp account.",
      });
    } catch (error) {
      console.error("Error disconnecting account:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect WhatsApp account",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Accounts</h1>
          <p className="text-muted-foreground">
            Manage your connected WhatsApp business accounts
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add WhatsApp Account</DialogTitle>
              <DialogDescription>
                Choose a method to connect your WhatsApp business account.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="qr">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="qr">QR Code</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
                <TabsTrigger value="api">Business API</TabsTrigger>
              </TabsList>
              
              <TabsContent value="qr" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-name">Account Name</Label>
                  <Input
                    id="qr-name"
                    placeholder="e.g., Marketing Account"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                  />
                </div>
                
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
                  onClick={() => handleAddAccount('QR code')}
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
              
              <TabsContent value="phone" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-name">Account Name</Label>
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
                
                {codeSent ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">Verification Code</Label>
                      <Input
                        id="verification-code"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleVerifyCode}
                      disabled={verifying || !verificationCode}
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
              
              <TabsContent value="api" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="api-name">Account Name</Label>
                  <Input
                    id="api-name"
                    placeholder="e.g., Business Account"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business-id">Business ID</Label>
                  <Input
                    id="business-id"
                    placeholder="Enter Meta Business ID"
                    value={businessId}
                    onChange={(e) => setBusinessId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
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
                  className="w-full" 
                  onClick={() => handleAddAccount('Business API')}
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
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {fetchingAccounts ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No WhatsApp Accounts</h3>
          <p className="text-center text-muted-foreground mb-4">
            You don't have any connected WhatsApp accounts yet. Add your first account to get started.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
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
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDisconnect(account.id)}
                      >
                        Disconnect
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
                    {account.type === 'qr' && <QrCode className="h-4 w-4" />}
                    {account.type === 'otp' && <PhoneCall className="h-4 w-4" />}
                    {account.type === 'api' && <Key className="h-4 w-4" />}
                    <span className="text-sm">{account.type === 'qr' ? 'QR Code' : account.type === 'otp' ? 'Phone Verification' : 'Business API'}</span>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Last active</span>
                    <span>{new Date(account.last_active || account.created_at || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Messages sent</span>
                    <span>-</span>
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
                    disabled
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

      {/* WhatsApp Web Browser Sheet */}
      <Sheet open={webBrowserOpen} onOpenChange={setWebBrowserOpen}>
        <SheetContent className="w-[90%] sm:max-w-[540px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Connect to WhatsApp Web</SheetTitle>
            <SheetDescription>
              Use your WhatsApp Web to connect your account
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 flex flex-col items-center justify-center h-[80vh]">
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
                handleAddAccount('QR code');
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Confirm Connection
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default WhatsAppAccounts;
