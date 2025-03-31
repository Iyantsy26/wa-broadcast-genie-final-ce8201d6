
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Info } from 'lucide-react';

interface WebWhatsAppSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const WebWhatsAppSheet = ({
  open,
  onOpenChange,
  onConfirm
}: WebWhatsAppSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
            onClick={onConfirm}
          >
            <Check className="mr-2 h-4 w-4" />
            Confirm Connection
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WebWhatsAppSheet;
