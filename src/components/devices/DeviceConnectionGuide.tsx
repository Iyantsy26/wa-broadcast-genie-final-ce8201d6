
import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, QrCode, PhoneCall, Key, Smartphone, HelpCircle, CheckCircle2, XCircle } from "lucide-react";

const DeviceConnectionGuide = () => {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>WhatsApp Device Connection Guide</AlertTitle>
        <AlertDescription>
          Learn how to connect your WhatsApp devices using different methods.
        </AlertDescription>
      </Alert>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="overview">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span>Overview</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <p>
                There are three ways to connect WhatsApp to our system:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>QR Code Connection:</strong> Scan with the WhatsApp mobile app (easiest method)</li>
                <li><strong>Phone Number Verification:</strong> Connect using your phone number and a verification code</li>
                <li><strong>WhatsApp Business API:</strong> For businesses using the official Meta WhatsApp Business API</li>
              </ul>
              <p>
                Choose the method that works best for your needs. The QR code method is recommended for most users.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="qr-code">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              <span>Connecting with QR Code</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <h4 className="font-medium">Step-by-Step Instructions:</h4>
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  <p><strong>Open WhatsApp on your phone</strong></p>
                  <p className="text-sm text-muted-foreground">Open the WhatsApp application on your mobile device</p>
                </li>
                <li>
                  <p><strong>Access Linked Devices</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Go to Settings (three dots in the top right) → Linked Devices → Link a Device
                  </p>
                </li>
                <li>
                  <p><strong>Scan QR Code</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Point your phone camera at the QR code displayed in our system
                  </p>
                </li>
                <li>
                  <p><strong>Confirmation</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Wait for confirmation on both your phone and our system that the connection is successful
                  </p>
                </li>
              </ol>
              
              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Troubleshooting
                </h4>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-1 shrink-0" />
                    <p className="text-sm"><strong>QR Code Expired:</strong> Click "Refresh QR Code" to generate a new one</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-1 shrink-0" />
                    <p className="text-sm"><strong>Connection Failed:</strong> Ensure your phone has an active internet connection</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-1 shrink-0" />
                    <p className="text-sm"><strong>Camera Issues:</strong> Make sure your camera has permission to scan QR codes</p>
                  </li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="phone-verification">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4" />
              <span>Phone Number Verification</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <h4 className="font-medium">Step-by-Step Instructions:</h4>
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  <p><strong>Enter your phone number</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Select your country code and enter your WhatsApp phone number without any spaces or special characters
                  </p>
                </li>
                <li>
                  <p><strong>Request verification code</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Click "Send Verification Code" to receive a 6-digit code via SMS
                  </p>
                </li>
                <li>
                  <p><strong>Enter verification code</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code you received in the verification field
                  </p>
                </li>
                <li>
                  <p><strong>Confirm connection</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Click "Verify Code" to complete the connection process
                  </p>
                </li>
              </ol>
              
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Notes</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1 mt-2">
                    <li>The phone number must be registered with WhatsApp</li>
                    <li>You can only connect one device per phone number</li>
                    <li>Verification codes expire after 10 minutes</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="business-api">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span>WhatsApp Business API Integration</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <p>
                This method is for businesses that have been approved for the WhatsApp Business API through Meta.
                You'll need your Business ID and API Key from the Meta Business Dashboard.
              </p>
              
              <h4 className="font-medium">Prerequisites:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Approved WhatsApp Business API account from Meta</li>
                <li>Business ID (found in Meta Business Dashboard)</li>
                <li>API Key (generated in Meta Business Dashboard)</li>
              </ul>
              
              <h4 className="font-medium">Step-by-Step Instructions:</h4>
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  <p><strong>Enter Business ID</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Copy your Business ID from Meta Business Dashboard and paste it in the Business ID field
                  </p>
                </li>
                <li>
                  <p><strong>Enter API Key</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Copy your API Key from Meta Business Dashboard and paste it in the API Key field
                  </p>
                </li>
                <li>
                  <p><strong>Connect API</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Click "Connect API" to establish the connection
                  </p>
                </li>
              </ol>
              
              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Benefits of Business API
                </h4>
                <ul className="mt-2 space-y-2 pl-6 list-disc">
                  <li className="text-sm">Higher message limits</li>
                  <li className="text-sm">Advanced automation features</li>
                  <li className="text-sm">Official business verification (green checkmark)</li>
                  <li className="text-sm">Multiple agent support</li>
                  <li className="text-sm">Advanced analytics</li>
                </ul>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Note: Business API connections require approval from Meta and may incur additional fees from Meta.
                Visit the <a href="https://developers.facebook.com/docs/whatsapp/business-management-api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WhatsApp Business API documentation</a> for more information.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default DeviceConnectionGuide;
