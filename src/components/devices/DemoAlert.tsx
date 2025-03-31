
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from 'lucide-react';

const DemoAlert = () => {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Demo Mode</AlertTitle>
      <AlertDescription>
        This is a demonstration of the WhatsApp integration UI. The QR codes and verification processes are simulated.
        In a production environment, these would connect to the actual WhatsApp Business API.
      </AlertDescription>
    </Alert>
  );
};

export default DemoAlert;
