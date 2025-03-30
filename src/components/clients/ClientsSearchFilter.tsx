
import React from 'react';
import { 
  Search, 
  Filter, 
  Import, 
  FileText, 
  ChevronDown 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ClientsSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onExportClients: () => void;
}

const ClientsSearchFilter: React.FC<ClientsSearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onExportClients
}) => {
  const handleImportClick = () => {
    toast({
      title: "Import feature",
      description: "Client import functionality will be implemented soon",
    });
  };

  return (
    <div className="flex items-center gap-4 mt-6">
      <div className="relative flex-grow max-w-xs">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          className="pl-10 h-12 rounded-lg"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="relative">
        <Select
          value={statusFilter}
          onValueChange={onStatusFilterChange}
        >
          <SelectTrigger className="w-44 h-12 pl-3 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="All Statuses" />
            <ChevronDown className="ml-auto h-4 w-4" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="VIP">VIP</SelectItem>
            <SelectItem value="Premium">Premium</SelectItem>
            <SelectItem value="New">New</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="ml-auto flex gap-3">
        <Button variant="outline" className="h-12 px-5 border-gray-300" onClick={handleImportClick}>
          <Import className="mr-2 h-5 w-5" />
          Import
        </Button>
        <Button variant="outline" className="h-12 px-5 border-gray-300" onClick={onExportClients}>
          <FileText className="mr-2 h-5 w-5" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default ClientsSearchFilter;
