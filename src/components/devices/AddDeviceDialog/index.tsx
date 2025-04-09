
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import QRCodeTab from './QRCodeTab';
import PhoneVerificationTab from './PhoneVerificationTab';
import BusinessAPITab from './BusinessAPITab';
import { addDeviceAccount } from '@/services/devices/deviceMutations';
import { getQrCodeForDevice } from '@/services/devices/deviceQueries';
import { toast } from "sonner";

interface AddDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAccount: (type: 'browser_qr' | 'browser_web' | 'phone_otp' | 'new_business' | 'business_api') => Promise<void>;
  canAddDevices: boolean;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  newAccountName: string;
  setNewAccountName: (name: string) => void;
  refreshDevices: () => void;
}

const AddDeviceDialog = ({
  open,
  onOpenChange,
  onAddAccount,
  canAddDevices,
  loading,
  setLoading,
  newAccountName,
  setNewAccountName,
  refreshDevices
}: AddDeviceDialogProps) => {
  const [businessId, setBusinessId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQrLoader, setShowQrLoader] = useState(true);
  const [currentDeviceId, setCurrentDeviceId] = useState('');
  const [activeTab, setActiveTab] = useState('browser_qr');

  // Initialize device and QR code
  useEffect(() => {
    if (open && activeTab === 'browser_qr') {
      generateQrCode();
    }
  }, [open, activeTab]);

  // Reset form state when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setBusinessId('');
    setApiKey('');
    setPhoneNumber('');
    setCountryCode('+1');
    setVerificationCode('');
    setCodeSent(false);
    setVerifying(false);
    setQrCodeUrl('');
    setShowQrLoader(true);
    setCurrentDeviceId('');
  };

  const generateQrCode = async () => {
    try {
      setShowQrLoader(true);
      setLoading(true);
      
      // Create a temporary device account
      const tempDevice = await addDeviceAccount({
        name: newAccountName || 'New Device',
        phone: 'Pending Connection',
        status: 'disconnected',
        type: 'browser_qr',
      });
      
      setCurrentDeviceId(tempDevice.id);
      
      // Get QR code for this device
      const qrCode = await getQrCodeForDevice(tempDevice.id);
      setQrCodeUrl(qrCode);
      
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setShowQrLoader(false);
      setLoading(false);
    }
  };

  const handleRefreshQrCode = () => {
    generateQrCode();
  };

  const openWebWhatsApp = () => {
    // Open WhatsApp Web in a new tab/window
    window.open('https://web.whatsapp.com', '_blank');
  };

  const handleConnectSuccess = (deviceId: string) => {
    toast.success("Device connected successfully");
    refreshDevices();
    onOpenChange(false);
  };

  const handleCreatePhoneDevice = async () => {
    try {
      setLoading(true);
      
      // Create a temporary device account for phone verification
      const tempDevice = await addDeviceAccount({
        name: newAccountName || 'New Device',
        phone: `${countryCode} ${phoneNumber}`,
        status: 'disconnected',
        type: 'phone_otp',
      });
      
      setCurrentDeviceId(tempDevice.id);
      return tempDevice.id;
    } catch (error) {
      console.error("Error creating device:", error);
      toast.error("Failed to create device");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBusinessApiDevice = async () => {
    try {
      setLoading(true);
      
      // Create a temporary device account for business API
      const tempDevice = await addDeviceAccount({
        name: newAccountName || 'New Device',
        phone: 'Business API Account',
        status: 'disconnected',
        type: 'business_api',
        business_id: businessId,
      });
      
      setCurrentDeviceId(tempDevice.id);
      return tempDevice.id;
    } catch (error) {
      console.error("Error creating device:", error);
      toast.error("Failed to create device");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Initialize device based on tab
    if (tab === 'browser_qr' && !currentDeviceId) {
      generateQrCode();
    } else if (tab === 'phone_otp') {
      handleCreatePhoneDevice();
    } else if (tab === 'business_api') {
      handleCreateBusinessApiDevice();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={!canAddDevices}>
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
        
        <Tabs defaultValue="browser_qr" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browser_qr">QR Code</TabsTrigger>
            <TabsTrigger value="phone_otp">Phone</TabsTrigger>
            <TabsTrigger value="business_api">Business API</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browser_qr">
            <QRCodeTab 
              newAccountName={newAccountName}
              setNewAccountName={setNewAccountName}
              qrCodeUrl={qrCodeUrl}
              showQrLoader={showQrLoader}
              deviceId={currentDeviceId}
              handleRefreshQrCode={handleRefreshQrCode}
              openWebWhatsApp={openWebWhatsApp}
              loading={loading}
              onAddAccount={() => onAddAccount('browser_qr')}
              onConnectSuccess={handleConnectSuccess}
            />
          </TabsContent>
          
          <TabsContent value="phone_otp">
            <PhoneVerificationTab 
              newAccountName={newAccountName}
              setNewAccountName={setNewAccountName}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              countryCode={countryCode}
              setCountryCode={setCountryCode}
              verificationCode={verificationCode}
              setVerificationCode={setVerificationCode}
              deviceId={currentDeviceId}
              codeSent={codeSent}
              setCodeSent={setCodeSent}
              verifying={verifying}
              setVerifying={setVerifying}
              onSendVerificationCode={async () => {
                if (!currentDeviceId) {
                  const newId = await handleCreatePhoneDevice();
                  if (newId) {
                    setCurrentDeviceId(newId);
                  }
                }
              }}
              onVerifyCode={() => onAddAccount('phone_otp')}
              onVerifySuccess={handleConnectSuccess}
            />
          </TabsContent>
          
          <TabsContent value="business_api">
            <BusinessAPITab 
              newAccountName={newAccountName}
              setNewAccountName={setNewAccountName}
              businessId={businessId}
              setBusinessId={setBusinessId}
              apiKey={apiKey}
              setApiKey={setApiKey}
              deviceId={currentDeviceId}
              loading={loading}
              onAddAccount={onAddAccount}
              onConnectSuccess={handleConnectSuccess}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddDeviceDialog;
