
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Smartphone, Plus, RefreshCw, Settings, Trash2, Check, AlertCircle, PhoneCall, Key } from "lucide-react";
import { DeviceAccount } from "@/services/deviceService";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface DeviceListProps {
  accounts: DeviceAccount[];
  loading: boolean;
  fetchingAccounts: boolean;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (device: DeviceAccount) => void;
  onOpenAddDialog: () => void;
  canAddDevices: boolean;
}

const DeviceList = ({
  accounts,
  loading,
  fetchingAccounts,
  onConnect,
  onDisconnect,
  onDelete,
  onEdit,
  onOpenAddDialog,
  canAddDevices
}: DeviceListProps) => {
  const formatLastActive = (lastActive: string | undefined) => {
    if (!lastActive) return "Never";
    try {
      return formatDistanceToNow(new Date(lastActive), { addSuffix: true });
    } catch (e) {
      return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-red-500';
      case 'expired':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getConnectionTypeLabel = (type: string) => {
    switch (type) {
      case 'browser_qr':
      case 'browser_web':
        return 'QR Code';
      case 'phone_otp':
        return 'Phone Verification';
      case 'new_business':
      case 'business_api':
        return 'Business API';
      default:
        return type;
    }
  };
  
  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'browser_qr':
      case 'browser_web':
        return <div className="bg-blue-100 p-1.5 rounded-full"><Smartphone className="h-4 w-4 text-blue-600" /></div>;
      case 'phone_otp':
        return <div className="bg-green-100 p-1.5 rounded-full"><PhoneCall className="h-4 w-4 text-green-600" /></div>;
      case 'new_business':
      case 'business_api':
        return <div className="bg-purple-100 p-1.5 rounded-full"><Key className="h-4 w-4 text-purple-600" /></div>;
      default:
        return <div className="bg-gray-100 p-1.5 rounded-full"><Smartphone className="h-4 w-4 text-gray-600" /></div>;
    }
  };
  
  if (fetchingAccounts) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading devices...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!accounts || accounts.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="rounded-full bg-muted p-4">
            <Smartphone className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">No devices connected</h3>
            <p className="text-muted-foreground mb-4">Connect your first WhatsApp device to get started</p>
            <Button onClick={onOpenAddDialog} disabled={!canAddDevices || loading}>
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((device) => (
        <Card key={device.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-3">
                {getConnectionIcon(device.type)}
                <div>
                  <CardTitle className="text-lg">{device.name}</CardTitle>
                  <CardDescription>{device.phone}</CardDescription>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(device)}>
                    Edit Device
                  </DropdownMenuItem>
                  {device.status === 'connected' ? (
                    <DropdownMenuItem onClick={() => onDisconnect(device.id)}>
                      Disconnect
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => onDelete(device.id)}
                  >
                    Delete Device
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${getStatusColor(device.status)}`}
                ></div>
                <span className="text-sm capitalize">{device.status}</span>
              </div>
              <Badge variant="outline">{getConnectionTypeLabel(device.type)}</Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last active</span>
                <span>{formatLastActive(device.last_active)}</span>
              </div>
              {device.business_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business ID</span>
                  <span className="truncate max-w-[150px]">{device.business_id}</span>
                </div>
              )}
              {device.plan_tier && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="capitalize">{device.plan_tier}</span>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="pt-0">
            {device.status === 'connected' ? (
              <Button variant="outline" className="w-full text-green-600" disabled>
                <Check className="mr-2 h-4 w-4" />
                Connected
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onConnect(device.id)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : device.status === 'disconnected' ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reconnect
                  </>
                ) : (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Expired
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default DeviceList;
