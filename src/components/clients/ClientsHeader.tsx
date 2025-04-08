
import React, { useRef } from 'react';
import { Plus, Import, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import Papa from 'papaparse';
import { Client } from '@/types/conversation';
import { createClient } from '@/services/clientService';

interface ClientsHeaderProps {
  onAddClient: () => void;
}

const ClientsHeader: React.FC<ClientsHeaderProps> = ({ onAddClient }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processImport = async (file: File) => {
    toast({
      title: "Import started",
      description: `Importing ${file.name}. This may take a few moments.`,
    });

    try {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const { data, errors } = results;
          
          if (errors.length > 0) {
            console.error("CSV parsing errors:", errors);
            toast({
              title: "Import error",
              description: "There were errors parsing the CSV file. Please check the format and try again.",
              variant: "destructive",
            });
            return;
          }

          // Track import progress
          let successful = 0;
          let failed = 0;

          // Process each row
          for (const row of data) {
            if (!row.name) continue; // Skip rows without names
            
            try {
              // Map CSV columns to client fields and ensure required fields
              const client: Omit<Client, "id"> = {
                name: row.name || "Unknown", // Required field
                email: row.email || "",
                phone: row.phone || "",
                company: row.company || "",
                address: row.address || "",
                tags: row.tags ? row.tags.split(',').map((tag: string) => tag.trim()) : [],
                join_date: row.join_date || new Date().toISOString().split('T')[0],
                renewal_date: row.renewal_date || "",
                notes: row.notes || "",
                plan_details: row.plan_details || "",
                referred_by: row.referred_by || "",
                status: row.status || "active"
              };
              
              await createClient(client);
              successful++;
            } catch (error) {
              console.error("Error importing client:", error);
              failed++;
            }
          }

          // Show results
          toast({
            title: "Import completed",
            description: `${successful} clients imported successfully. ${failed} failed.`,
          });
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          toast({
            title: "Import failed",
            description: "Failed to parse the CSV file. Please check the format and try again.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImport(file);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExport = async () => {
    toast({
      title: "Generating export",
      description: "Your client data export is being prepared.",
    });
    
    try {
      // Fetch clients data from Supabase
      const { data, error } = await supabase
        .from('clients')
        .select('*');
      
      if (error) {
        throw error;
      }

      // Convert to CSV
      const csv = Papa.unparse(data.map(client => ({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        address: client.address || '',
        tags: client.tags ? client.tags.join(', ') : '',
        join_date: client.join_date || '',
        renewal_date: client.renewal_date || '',
        notes: client.notes || '',
        plan_details: client.plan_details || '',
        referred_by: client.referred_by || ''
      })));

      // Create and download the file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `clients_export_${date}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export ready",
        description: `Client data has been exported to clients_export_${date}.csv`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export client data. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">CLIENTS</h1>
      <div className="flex gap-2">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
        />
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
