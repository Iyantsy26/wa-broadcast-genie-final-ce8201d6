
import React, { useState } from 'react';
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

interface AddDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAccount: (type: 'browser_qr' | 'browser_web' | 'phone_otp' | 'new_business' | 'business_api') => Promise<void>;
  canAddDevices: boolean;
  loading: boolean;
  newAccountName: string;
  setNewAccountName: (name: string) => void;
  businessId: string;
  setBusinessId: (id: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  phoneNumber: string;
  setPhoneNumber: (number: string) => void;
  countryCode: string;
  setCountryCode: (code: string) => void;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  codeSent: boolean;
  setCodeSent: (sent: boolean) => void;
  verifying: boolean;
  setVerifying: (verifying: boolean) => void;
  onSendVerificationCode: () => void;
  onVerifyCode: () => void;
  generateQrCode: () => void;
  handleRefreshQrCode: () => void;
  openWebWhatsApp: () => void;
  qrCodeUrl: string;
  showQrLoader: boolean;
}

const AddDeviceDialog = ({
  open,
  onOpenChange,
  onAddAccount,
  canAddDevices,
  loading,
  newAccountName,
  setNewAccountName,
  businessId,
  setBusinessId,
  apiKey,
  setApiKey,
  phoneNumber,
  setPhoneNumber,
  countryCode,
  setCountryCode,
  verificationCode,
  setVerificationCode,
  codeSent,
  setCodeSent,
  verifying,
  setVerifying,
  onSendVerificationCode,
  onVerifyCode,
  generateQrCode,
  handleRefreshQrCode,
  openWebWhatsApp,
  qrCodeUrl,
  showQrLoader
}: AddDeviceDialogProps) => {
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
        
        <Tabs defaultValue="browser_qr">
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
              handleRefreshQrCode={handleRefreshQrCode}
              openWebWhatsApp={openWebWhatsApp}
              loading={loading}
              onAddAccount={() => onAddAccount('browser_qr')}
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
              codeSent={codeSent}
              verifying={verifying}
              onSendVerificationCode={onSendVerificationCode}
              onVerifyCode={onVerifyCode}
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
              loading={loading}
              onAddAccount={onAddAccount}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddDeviceDialog;
