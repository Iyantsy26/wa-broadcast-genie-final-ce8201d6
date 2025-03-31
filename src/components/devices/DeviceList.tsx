
import React from 'react';
import { Loader2, Smartphone, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DeviceAccount } from '@/services/deviceService';
import DeviceCard from './DeviceCard';

interface DeviceListProps {
  accounts: DeviceAccount[];
  loading: boolean;
  fetchingAccounts: boolean;
  onConnect: (accountId: string) => void;
  onDisconnect: (accountId: string) => void;
  onDelete: (accountId: string) => void;
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
  onOpenAddDialog,
  canAddDevices
}: DeviceListProps) => {
  if (fetchingAccounts) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Devices Connected</h3>
        <p className="text-center text-muted-foreground mb-4">
          You don't have any connected WhatsApp devices yet. Add your first device to get started.
        </p>
        <Button 
          onClick={onOpenAddDialog}
          disabled={!canAddDevices}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Device
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <DeviceCard
          key={account.id}
          account={account}
          loading={loading}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default DeviceList;
