
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientsHeaderProps {
  onAddClient: () => void;
}

const ClientsHeader: React.FC<ClientsHeaderProps> = ({ onAddClient }) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
      <Button 
        className="bg-primary hover:bg-primary/90" 
        onClick={onAddClient}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Client
      </Button>
    </div>
  );
};

export default ClientsHeader;
