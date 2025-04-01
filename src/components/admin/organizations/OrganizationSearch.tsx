
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface OrganizationSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const OrganizationSearch: React.FC<OrganizationSearchProps> = ({ 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search organizations..."
        className="pl-8"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default OrganizationSearch;
