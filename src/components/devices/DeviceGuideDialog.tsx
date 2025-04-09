
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from 'lucide-react';
import DeviceConnectionGuide from './DeviceConnectionGuide';

interface DeviceGuideDialogProps {
  className?: string;
}

const DeviceGuideDialog = ({ className }: DeviceGuideDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Connection Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>WhatsApp Device Connection Guide</DialogTitle>
          <DialogDescription>
            Learn how to connect your WhatsApp devices using different methods.
          </DialogDescription>
        </DialogHeader>
        <DeviceConnectionGuide />
      </DialogContent>
    </Dialog>
  );
};

export default DeviceGuideDialog;
