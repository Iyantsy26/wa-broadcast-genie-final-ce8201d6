
import React from 'react';
import { Plus, Import, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ClientsHeaderProps {
  onAddClient: () => void;
}

const ClientsHeader: React.FC<ClientsHeaderProps> = ({ onAddClient }) => {
  const handleImport = () => {
    toast({
      title: "Import feature",
      description: "Client import functionality will be implemented soon",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export feature",
      description: "Client export functionality will be implemented soon",
    });
  };

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">CLIENTS</h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleImport} className="flex items-center">
          <Import className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button variant="outline" onClick={handleExport} className="flex items-center">
          <FileText className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button 
          className="bg-green-600 hover:bg-green-700" 
          size="lg"
          onClick={onAddClient}
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Client
        </Button>
      </div>
    </div>
  );
};

export default ClientsHeader;
