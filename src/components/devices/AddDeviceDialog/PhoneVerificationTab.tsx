
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Info, Loader2, PhoneCall } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { sendVerificationCode, verifyPhoneNumber } from '@/services/devices/deviceMutations';
import { toast } from "sonner";

interface PhoneVerificationTabProps {
  newAccountName: string;
  setNewAccountName: (name: string) => void;
  phoneNumber: string;
  setPhoneNumber: (number: string) => void;
  countryCode: string;
  setCountryCode: (code: string) => void;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  deviceId: string;
  codeSent: boolean;
  setCodeSent: (sent: boolean) => void;
  verifying: boolean;
  setVerifying: (verifying: boolean) => void;
  onSendVerificationCode: () => void;
  onVerifyCode: () => void;
  onVerifySuccess?: (deviceId: string) => void;
}

const PhoneVerificationTab = ({
  newAccountName,
  setNewAccountName,
  phoneNumber,
  setPhoneNumber,
  countryCode,
  setCountryCode,
  verificationCode,
  setVerificationCode,
  deviceId,
  codeSent,
  setCodeSent,
  verifying,
  setVerifying,
  onSendVerificationCode,
  onVerifyCode,
  onVerifySuccess
}: PhoneVerificationTabProps) => {
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Debug flag - for testing only, display verification code in browser
  const [debugMode] = useState(process.env.NODE_ENV === 'development');
  const [debugVerificationCode, setDebugVerificationCode] = useState<string>('');
  
  // Handle sending verification code with real functionality
  const handleSendVerification = async () => {
    if (!phoneNumber || !deviceId) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setVerifying(true);
    
    try {
      await onSendVerificationCode();
      
      const result = await sendVerificationCode(phoneNumber, countryCode, deviceId);
      
      if (result.success) {
        setCodeSent(true);
        // Start cooldown timer for resend
        setResendCooldown(60);
        toast.success(result.message);
        
        // For development/testing purposes, extract and display verification code
        if (debugMode) {
          // Extract verification code from console logs (hack for demo/testing)
          const verificationLog = console.logs?.find(log => 
            log.includes("[SMS SERVICE] Verification code") && log.includes(phoneNumber)
          );
          
          if (verificationLog) {
            const match = verificationLog.match(/Verification code (\d+) sent/);
            if (match && match[1]) {
              setDebugVerificationCode(match[1]);
            }
          }
        }
      } else {
        toast.error(result.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error("Failed to send verification code");
    } finally {
      setVerifying(false);
    }
  };
  
  // Handle verifying code with real functionality
  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length < 6 || !deviceId) {
      toast.error("Please enter a valid verification code");
      return;
    }
    
    setVerifying(true);
    
    try {
      const result = await verifyPhoneNumber(deviceId, verificationCode);
      
      if (result.success) {
        if (onVerifySuccess) {
          onVerifySuccess(deviceId);
        }
        toast.success(result.message);
        onVerifyCode();
      } else {
        toast.error(result.message || "Invalid verification code");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error("Failed to verify code");
    } finally {
      setVerifying(false);
    }
  };
  
  // Cooldown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

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
    <div className="space-y-4 py-4">
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
          Enter your WhatsApp phone number. A verification code will be sent to verify your device.
        </AlertDescription>
      </Alert>
      
      {/* Debug verification code display for development only */}
      {debugMode && debugVerificationCode && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-500">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Development mode: Your verification code is <span className="font-bold">{debugVerificationCode}</span>
          </AlertDescription>
        </Alert>
      )}
      
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
            <div className="flex justify-between">
              <p className="text-xs text-muted-foreground mt-2">
                Enter the 6-digit code sent to your phone
              </p>
              {resendCooldown > 0 ? (
                <p className="text-xs text-muted-foreground mt-2">
                  Resend in {resendCooldown}s
                </p>
              ) : (
                <button
                  onClick={handleSendVerification}
                  disabled={verifying}
                  className="text-xs text-primary hover:text-primary/80 transition-colors mt-2"
                >
                  Resend code
                </button>
              )}
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={handleVerify}
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
            onClick={handleSendVerification}
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
    </div>
  );
};

export default PhoneVerificationTab;
