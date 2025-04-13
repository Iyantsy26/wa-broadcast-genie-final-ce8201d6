
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DeviceAccount } from '@/services/deviceService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeviceSelectorProps {
  selectedDevice: string;
  onSelectDevice: (deviceId: string) => void;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  selectedDevice,
  onSelectDevice
}) => {
  const [devices, setDevices] = useState<DeviceAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper function to validate UUID format
  const isValidUuid = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  useEffect(() => {
    async function fetchDevices() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('device_accounts')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        setDevices(data as DeviceAccount[]);
        
        // If we have devices but none selected, select the first one
        if (data && data.length > 0 && !selectedDevice) {
          onSelectDevice(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
        toast({
          title: 'Error',
          description: 'Could not load WhatsApp devices',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchDevices();
    
    // Set up real-time listener for device changes
    const channel = supabase
      .channel('device-changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'device_accounts'
        },
        (payload) => {
          console.log('Real-time device update received:', payload);
          fetchDevices(); // Refresh the list when changes occur
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Removed selectedDevice and onSelectDevice from dependencies to avoid unnecessary re-fetches

  // Update the device if it's a valid selection
  useEffect(() => {
    if (selectedDevice && devices.length > 0 && 
        !devices.some(device => device.id === selectedDevice)) {
      // If the selected device is not in the devices list, select the first one
      onSelectDevice(devices[0].id);
    }
  }, [selectedDevice, devices, onSelectDevice]);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Smartphone className="h-5 w-5 text-gray-500" />
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading devices...</span>
        </div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Smartphone className="h-5 w-5 text-gray-500" />
        <span className="text-sm text-muted-foreground">No devices available</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Smartphone className="h-5 w-5 text-gray-500" />
      <div>
        <Select 
          value={selectedDevice} 
          onValueChange={(value) => {
            // Only set if it's one of our devices
            if (devices.some(device => device.id === value)) {
              onSelectDevice(value);
            }
          }}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select WhatsApp device" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem key={device.id} value={device.id}>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-xs text-muted-foreground">{device.phone}</div>
                  </div>
                  <Badge variant={device.status === 'connected' ? 'default' : 'outline'}>
                    {device.status}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DeviceSelector;
