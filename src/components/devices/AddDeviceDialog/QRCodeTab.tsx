
import React, { useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Globe, Info, Loader2, RefreshCw, QrCode } from 'lucide-react';
import { getQrCodeForDevice } from '@/services/devices/deviceQueries';
import { connectDeviceViaQR } from '@/services/devices/deviceMutations';

interface QRCodeTabProps {
  newAccountName: string;
  setNewAccountName: (name: string) => void;
  qrCodeUrl: string;
  showQrLoader: boolean;
  deviceId: string;
  handleRefreshQrCode: () => void;
  openWebWhatsApp: () => void;
  loading: boolean;
  onAddAccount: () => void;
  onConnectSuccess?: (deviceId: string) => void;
}

const QRCodeTab = ({
  newAccountName,
  setNewAccountName,
  qrCodeUrl,
  showQrLoader,
  deviceId,
  handleRefreshQrCode,
  openWebWhatsApp,
  loading,
  onAddAccount,
  onConnectSuccess
}: QRCodeTabProps) => {
  useEffect(() => {
    if (deviceId) {
      // Poll for connection status every 5 seconds when a QR code is displayed
      const intervalId = setInterval(async () => {
        try {
          if (deviceId) {
            const result = await connectDeviceViaQR(deviceId);
            if (result.success && onConnectSuccess) {
              clearInterval(intervalId);
              onConnectSuccess(deviceId);
            }
          }
        } catch (error) {
          console.error("Error checking connection status:", error);
        }
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [deviceId, onConnectSuccess]);
  
  return (
    <div className="space-y-4 py-4">
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
          Scan this QR code with your WhatsApp app. Open WhatsApp, go to Settings &gt; Linked Devices &gt; Link a Device.
        </AlertDescription>
      </Alert>
      
      <div className="border rounded-md p-6 flex flex-col items-center justify-center">
        {showQrLoader ? (
          <div className="flex flex-col items-center justify-center h-32 w-32">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground mt-4">Generating QR code...</p>
          </div>
        ) : (
          <div className="relative">
            <img src={qrCodeUrl} alt="WhatsApp QR Code" className="h-32 w-32" />
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
              <QrCode className="h-4 w-4 text-green-600" />
            </div>
          </div>
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
        onClick={onAddAccount}
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
    </div>
  );
};

export default QRCodeTab;
