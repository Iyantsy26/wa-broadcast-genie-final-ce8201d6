
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Client } from '@/types/conversation';
import { 
  ArrowUpDown, 
  Eye, 
  MoreHorizontal,
  Pencil,
  Trash,
  UserRound
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  searchTerm: string;
  statusFilter: string;
  onViewClient: (client: Client) => void;
  onMessageClient: (client: Client) => Promise<void>;
  formatDate: (dateString?: string) => string;
}

const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  isLoading,
  searchTerm,
  statusFilter,
  onViewClient,
  formatDate
}) => {
  // Filter clients based on searchTerm and statusFilter
  const filteredClients = clients.filter(client => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || true; // We don't have status in client yet
    
    return matchesSearch && matchesStatus;
  });

  // Display skeletons when loading
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Renewal</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(6)].map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Display empty state when no clients match filters
  if (filteredClients.length === 0) {
    return (
      <div className="p-8 text-center">
        <UserRound className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-semibold">No clients found</h3>
        <p className="text-muted-foreground">
          {searchTerm || statusFilter !== 'all' 
            ? "No clients match your search criteria. Try adjusting your filters." 
            : "You haven't added any clients yet."}
        </p>
      </div>
    );
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <div className="flex items-center">
              Name
              <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground cursor-pointer" />
            </div>
          </TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>
            <div className="flex items-center">
              Join Date
              <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground cursor-pointer" />
            </div>
          </TableHead>
          <TableHead>Renewal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredClients.map((client) => (
          <TableRow key={client.id} className="cursor-pointer" onClick={() => onViewClient(client)}>
            <TableCell className="font-medium">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={client.avatar_url} alt={client.name} />
                  <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                </Avatar>
                {client.name}
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                {client.email && <div className="text-sm">{client.email}</div>}
                {client.phone && <div className="text-xs text-muted-foreground">{client.phone}</div>}
              </div>
            </TableCell>
            <TableCell>
              {client.company || "—"}
            </TableCell>
            <TableCell>
              {formatDate(client.join_date)}
            </TableCell>
            <TableCell>
              {client.renewal_date ? formatDate(client.renewal_date) : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ClientsTable;
