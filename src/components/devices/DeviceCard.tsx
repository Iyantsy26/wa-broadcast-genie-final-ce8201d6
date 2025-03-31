
import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  MoreVertical, 
  Settings2, 
  Trash2, 
  RefreshCw, 
  Check, 
  QrCode, 
  Globe, 
  PhoneCall, 
  Key,
  Building2,
  Smartphone
} from 'lucide-react';
import { DeviceAccount } from '@/services/deviceService';
import { useToast } from "@/hooks/use-toast";

interface DeviceCardProps {
  account: DeviceAccount;
  loading: boolean;
  onConnect: (accountId: string) => void;
  onDisconnect: (accountId: string) => void;
  onDelete: (accountId: string) => void;
  onEdit: (account: DeviceAccount) => void;
}

const DeviceCard = ({ 
  account, 
  loading, 
  onConnect, 
  onDisconnect, 
  onDelete,
  onEdit
}: DeviceCardProps) => {
  const { toast } = useToast();

  const getDeviceTypeLabel = (type: string) => {
    switch(type) {
      case 'browser_qr': return 'QR Code';
      case 'browser_web': return 'Web Browser';
      case 'phone_otp': return 'Phone Verification';
      case 'new_business': return 'Business Account';
      case 'business_api': return 'Business API';
      default: return type;
    }
  };

  const getDeviceTypeIcon = (type: string) => {
    switch(type) {
      case 'browser_qr': return <QrCode className="h-4 w-4" />;
      case 'browser_web': return <Globe className="h-4 w-4" />;
      case 'phone_otp': return <PhoneCall className="h-4 w-4" />;
      case 'new_business': return <Building2 className="h-4 w-4" />;
      case 'business_api': return <Key className="h-4 w-4" />;
      default: return <Smartphone className="h-4 w-4" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{account.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(account)}>
                <Settings2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete(account.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>{account.phone}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                account.status === 'connected'
                  ? 'bg-green-500'
                  : account.status === 'disconnected'
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
              }`}
            />
            <span className="text-sm capitalize">{account.status}</span>
          </div>
          <div className="flex items-center gap-2">
            {getDeviceTypeIcon(account.type)}
            <span className="text-sm">{getDeviceTypeLabel(account.type)}</span>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Last active</span>
            <span>{new Date(account.last_active || account.created_at || '').toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Plan</span>
            <span className="capitalize">{account.plan_tier || 'starter'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        {account.status !== 'connected' ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onConnect(account.id)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reconnecting...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reconnect
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full text-green-600"
            onClick={() => onDisconnect(account.id)}
          >
            <Check className="mr-2 h-4 w-4" />
            Connected
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DeviceCard;
