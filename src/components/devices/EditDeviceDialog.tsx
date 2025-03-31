
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Save } from 'lucide-react';
import { DeviceAccount } from '@/services/deviceService';

interface EditDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<DeviceAccount>) => Promise<void>;
  loading: boolean;
  device: DeviceAccount | null;
}

const EditDeviceDialog = ({
  open,
  onOpenChange,
  onSave,
  loading,
  device
}: EditDeviceDialogProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [planTier, setPlanTier] = useState<'starter' | 'professional' | 'enterprise'>('starter');

  useEffect(() => {
    if (device) {
      setName(device.name || '');
      setPhone(device.phone || '');
      setPlanTier((device.plan_tier || 'starter') as 'starter' | 'professional' | 'enterprise');
    }
  }, [device]);

  const handleSave = async () => {
    if (!device) return;
    
    try {
      await onSave(device.id, {
        name,
        phone,
        plan_tier: planTier
      });
    } catch (error) {
      console.error("Error saving device:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
          <DialogDescription>
            Make changes to your device settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Device name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="col-span-3"
              placeholder="Phone number"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan" className="text-right">
              Plan
            </Label>
            <Select value={planTier} onValueChange={(value: any) => setPlanTier(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDeviceDialog;
