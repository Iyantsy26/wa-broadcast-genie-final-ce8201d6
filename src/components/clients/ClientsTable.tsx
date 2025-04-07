
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
  UserRound,
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
  onMessageClient: (client: Client) => Promise<void>; // Added this prop
  formatDate: (dateString?: string) => string;
}

const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  isLoading,
  searchTerm,
  statusFilter,
  onViewClient,
  onMessageClient,
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
          <TableHead className="text-right">Actions</TableHead>
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
            <TableCell className="text-right">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewClient(client);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onViewClient(client);
                    }}>
                      <Eye className="mr-2 h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onMessageClient(client);
                    }}>
                      {/* Using message icon directly as we're removing the icon components */}
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Message
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={e => e.stopPropagation()}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={e => e.stopPropagation()}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ClientsTable;
