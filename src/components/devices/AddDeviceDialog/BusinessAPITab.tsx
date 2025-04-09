
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Loader2, Info } from 'lucide-react';
import { connectDeviceViaBusinessAPI } from '@/services/devices/deviceMutations';
import { toast } from "sonner";

interface BusinessAPITabProps {
  newAccountName: string;
  setNewAccountName: (name: string) => void;
  businessId: string;
  setBusinessId: (id: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  deviceId: string;
  loading: boolean;
  onAddAccount: (type: 'browser_qr' | 'browser_web' | 'phone_otp' | 'new_business' | 'business_api') => Promise<void>;
  onConnectSuccess?: (deviceId: string) => void;
}

const BusinessAPITab = ({
  newAccountName,
  setNewAccountName,
  businessId,
  setBusinessId,
  apiKey,
  setApiKey,
  deviceId,
  loading,
  onAddAccount,
  onConnectSuccess
}: BusinessAPITabProps) => {
  const handleConnect = async () => {
    if (!deviceId || !businessId || !apiKey) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      const result = await connectDeviceViaBusinessAPI(deviceId, businessId, apiKey);
      
      if (result.success) {
        if (onConnectSuccess) {
          onConnectSuccess(deviceId);
        }
        toast.success(result.message);
        onAddAccount('business_api');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error connecting via Business API:", error);
      toast.error("Failed to connect via Business API");
    }
  };
  
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="api-name">Device Name</Label>
        <Input
          id="api-name"
          placeholder="e.g., Business API Account"
          value={newAccountName}
          onChange={(e) => setNewAccountName(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="business-id">WhatsApp Business ID</Label>
        <Input
          id="business-id"
          placeholder="Enter your WhatsApp Business ID"
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="api-key">WhatsApp Business API Key</Label>
        <Input
          id="api-key"
          type="password"
          placeholder="Enter your WhatsApp Business API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Enter your WhatsApp Business ID and API Key from the Meta Developer Dashboard
        </AlertDescription>
      </Alert>
      
      <Button 
        className="w-full" 
        onClick={handleConnect}
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
    </div>
  );
};

export default BusinessAPITab;
