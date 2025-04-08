
import React from 'react';
import { Plus, Import, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ClientsHeaderProps {
  onAddClient: () => void;
}

const ClientsHeader: React.FC<ClientsHeaderProps> = ({ onAddClient }) => {
  const handleImport = () => {
    // Simulate file input click
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv,.xlsx,.xls';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // In a real app, this would be handled by a proper import service
        toast({
          title: "Import started",
          description: `Importing ${file.name}. This may take a few moments.`,
        });
        
        // Simulate successful import after delay
        setTimeout(() => {
          toast({
            title: "Import successful",
            description: "Client data has been imported successfully.",
          });
        }, 1500);
      }
    };
    fileInput.click();
  };

  const handleExport = () => {
    // In a real app, this would generate and download a file
    toast({
      title: "Generating export",
      description: "Your client data export is being prepared.",
    });
    
    // Simulate successful export after delay
    setTimeout(() => {
      toast({
        title: "Export ready",
        description: "Client data has been exported to clients_export.csv",
      });
    }, 1500);
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
