
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DeviceSelectorProps {
  selectedDevice: string;
  onSelectDevice: (deviceId: string) => void;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  selectedDevice,
  onSelectDevice
}) => {
  // Mock device data
  const devices = [
    { id: '1', name: 'Company iPhone', status: 'online', number: '+1 (555) 123-4567' },
    { id: '2', name: 'Sales Phone', status: 'online', number: '+1 (555) 234-5678' },
    { id: '3', name: 'Support Phone', status: 'offline', number: '+1 (555) 345-6789' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Smartphone className="h-5 w-5 text-gray-500" />
      <div>
        <Select value={selectedDevice} onValueChange={onSelectDevice}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select WhatsApp device" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem key={device.id} value={device.id}>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-xs text-muted-foreground">{device.number}</div>
                  </div>
                  <Badge variant={device.status === 'online' ? 'default' : 'outline'}>
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
