
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";

interface AdminHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddAdmin: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onAddAdmin
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="relative w-full md:w-80">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search administrators..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button onClick={onAddAdmin}>
        <UserPlus className="h-4 w-4 mr-2" />
        Add Administrator
      </Button>
    </div>
  );
};

export default AdminHeader;
