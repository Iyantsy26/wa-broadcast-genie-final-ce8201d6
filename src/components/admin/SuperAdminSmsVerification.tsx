
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Check, Send, Smartphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DeviceAccount } from '@/services/devices/deviceTypes';
import { sendVerificationCode } from '@/services/devices/deviceMutations';

const SuperAdminSmsVerification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('select');
  const [selectedDevice, setSelectedDevice] = useState<DeviceAccount | null>(null);
  const [devices, setDevices] = useState<DeviceAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [isDataReady, setIsDataReady] = useState(false);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('device_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDevices(data as DeviceAccount[]);
      setIsDataReady(true);
    } catch (err) {
      console.error('Error fetching devices:', err);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !isDataReady) {
      fetchDevices();
    }
  };

  const handleDeviceSelect = (device: DeviceAccount) => {
    setSelectedDevice(device);
    setPhoneNumber(device.phone.replace(/^\+\d+ /, ''));  // Remove country code if present
    setStep('configure');
  };

  const sendSmsVerification = async () => {
    if (!selectedDevice) return;
    
    setLoading(true);
    try {
      const result = await sendVerificationCode(phoneNumber, countryCode, selectedDevice.id);
      
      if (result.success) {
        toast.success('Verification code sent successfully');
        setStep('complete');
      } else {
        toast.error(result.message || 'Failed to send verification code');
      }
    } catch (err) {
      console.error('Error sending verification:', err);
      toast.error('Error sending verification code');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceTypeLabel = (type: string) => {
    switch (type) {
      case 'browser_qr': return 'QR Code';
      case 'browser_web': return 'Browser';
      case 'phone_otp': return 'Phone OTP';
      case 'business_api': return 'Business API';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Send className="mr-2 h-4 w-4" />
          Send SMS Verification
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>SMS Verification Management</DialogTitle>
          <DialogDescription>
            Send verification codes to WhatsApp devices
          </DialogDescription>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Select Device</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchDevices}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
              </Button>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {devices.length === 0 ? (
                  <p className="col-span-2 text-center text-muted-foreground py-8">
                    No devices found
                  </p>
                ) : (
                  devices.map(device => (
                    <Card 
                      key={device.id} 
                      className={`cursor-pointer transition-all hover:border-primary ${
                        selectedDevice?.id === device.id ? 'border-primary ring-1 ring-primary' : ''
                      }`}
                      onClick={() => handleDeviceSelect(device)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{device.name}</CardTitle>
                        <CardDescription>{device.phone}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <span>{getDeviceTypeLabel(device.type)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span className={`
                            ${device.status === 'connected' ? 'text-green-600' : ''}
                            ${device.status === 'disconnected' ? 'text-red-600' : ''}
                            ${device.status === 'expired' ? 'text-amber-600' : ''}
                          `}>
                            {getStatusLabel(device.status)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {step === 'configure' && selectedDevice && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  {selectedDevice.name}
                </CardTitle>
                <CardDescription>{selectedDevice.phone}</CardDescription>
              </CardHeader>
            </Card>
            
            <div className="space-y-4">
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
              
              <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Important</h4>
                    <p className="text-sm text-amber-700">
                      This will send a real verification code to the specified phone number.
                      The verification code will expire after 10 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-medium">Verification Code Sent</h3>
            <p className="text-center text-muted-foreground max-w-md">
              The verification code has been sent to {countryCode} {phoneNumber}.
              The user should enter this code on their device to complete verification.
            </p>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step === 'select' && (
            <Button 
              onClick={() => setIsOpen(false)}
              variant="outline" 
              className="sm:ml-auto"
            >
              Cancel
            </Button>
          )}
          
          {step === 'configure' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setStep('select')} 
                className="sm:mr-auto"
              >
                Back
              </Button>
              
              <Button 
                onClick={sendSmsVerification}
                disabled={loading || !phoneNumber}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Code
              </Button>
            </>
          )}
          
          {step === 'complete' && (
            <Button 
              onClick={() => {
                setIsOpen(false);
                setStep('select');
                setSelectedDevice(null);
              }}
            >
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuperAdminSmsVerification;
