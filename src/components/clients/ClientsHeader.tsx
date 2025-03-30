
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientsHeaderProps {
  onAddClient: () => void;
}

const ClientsHeader: React.FC<ClientsHeaderProps> = ({ onAddClient }) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">CLIENTS</h1>
      <Button 
        className="bg-green-600 hover:bg-green-700" 
        size="lg"
        onClick={onAddClient}
      >
        <Plus className="mr-2 h-5 w-5" />
        Add New Client
      </Button>
    </div>
  );
};

export default ClientsHeader;
