
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Info, Loader2, PhoneCall } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface PhoneVerificationTabProps {
  newAccountName: string;
  setNewAccountName: (name: string) => void;
  phoneNumber: string;
  setPhoneNumber: (number: string) => void;
  countryCode: string;
  setCountryCode: (code: string) => void;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  codeSent: boolean;
  verifying: boolean;
  onSendVerificationCode: () => void;
  onVerifyCode: () => void;
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
  codeSent,
  verifying,
  onSendVerificationCode,
  onVerifyCode
}: PhoneVerificationTabProps) => {
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
            onClick={onVerifyCode}
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
            onClick={onSendVerificationCode}
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
