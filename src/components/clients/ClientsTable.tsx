
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  onMessageClient: (client: Client) => Promise<void>; // We'll keep this but won't use it
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
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);

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

  // Handle client click to view details
  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  // Handle edit client
  const handleEditClient = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    // In the future, this will open an edit form
    // For now we'll just show a toast
    onViewClient(client);
  };

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
    <>
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
            <TableRow key={client.id} className="cursor-pointer" onClick={() => handleClientClick(client)}>
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
                    onClick={(e) => handleEditClient(e, client)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white z-50">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleClientClick(client);
                      }}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleEditClient(e, client);
                      }}>
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

      {/* Client Details Dialog */}
      {selectedClient && (
        <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Client Details</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center mb-6">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src={selectedClient.avatar_url} alt={selectedClient.name} />
                  <AvatarFallback>{getInitials(selectedClient.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-semibold">{selectedClient.name}</h3>
                  <p className="text-gray-500">{selectedClient.company || "No company"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p>{selectedClient.email || "—"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                  <p>{selectedClient.phone || "—"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Join Date</h4>
                  <p>{formatDate(selectedClient.join_date)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Renewal Date</h4>
                  <p>{selectedClient.renewal_date ? formatDate(selectedClient.renewal_date) : "—"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Address</h4>
                  <p>{selectedClient.address || "—"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Referred By</h4>
                  <p>{selectedClient.referred_by || "—"}</p>
                </div>
              </div>

              {selectedClient.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                  <p className="mt-1 text-gray-700">{selectedClient.notes}</p>
                </div>
              )}

              {selectedClient.tags && selectedClient.tags.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500">Tags</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedClient.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowClientDetails(false)}>Close</Button>
              <Button onClick={(e) => handleEditClient(e, selectedClient)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ClientsTable;
