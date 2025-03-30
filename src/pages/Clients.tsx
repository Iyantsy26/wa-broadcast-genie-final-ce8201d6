import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Phone, 
  Mail, 
  MessageCircle, 
  UserRound,
  Filter,
  Import,
  FileText,
  X
} from 'lucide-react';
import { getClients } from '@/services/clientService';
import { Client } from '@/types/conversation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ClientForm from '@/components/clients/ClientForm';
import { createConversation } from '@/services/conversationService';
import ActiveFilterBadges from '@/components/conversations/ActiveFilterBadges';

const Clients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { 
    data: clients = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients
  });

  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.phone && client.phone.includes(searchTerm));
      
    const matchesStatusFilter = statusFilter === 'all' || 
      (client.tags && client.tags.includes(statusFilter));
    
    return matchesSearch && matchesStatusFilter;
  });

  const handleFormComplete = () => {
    setIsAddDialogOpen(false);
    setViewingClient(null);
    setIsViewDialogOpen(false);
    refetch();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const handleMessage = async (client: Client) => {
    try {
      const initialMessage = `Hello ${client.name}, how can I help you today?`;
      const conversationId = await createConversation(client.id, 'client', initialMessage);
      
      navigate(`/conversations?id=${conversationId}`);
      
      toast({
        title: "Conversation created",
        description: `Started a new conversation with ${client.name}`,
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create conversation with client.",
        variant: "destructive",
      });
    }
  };

  const handleViewClient = (client: Client) => {
    setViewingClient(client);
    setIsViewDialogOpen(true);
  };

  const handleExportClients = () => {
    try {
      const clientsToExport = filteredClients.map(client => ({
        Name: client.name,
        Company: client.company || '',
        Email: client.email || '',
        Phone: client.phone || '',
        Address: client.address || '',
        'Join Date': formatDate(client.join_date),
        'Renewal Date': formatDate(client.renewal_date),
        'Plan Details': client.plan_details || '',
        Tags: client.tags ? client.tags.join(', ') : ''
      }));

      const headers = Object.keys(clientsToExport[0]);
      const csvContent = 
        headers.join(',') + 
        '\n' + 
        clientsToExport.map(row => 
          headers.map(header => 
            JSON.stringify(row[header as keyof typeof row] || '')
          ).join(',')
        ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'clients.csv');
      link.click();

      toast({
        title: "Export successful",
        description: `Exported ${clientsToExport.length} clients to CSV`,
      });
    } catch (error) {
      console.error("Error exporting clients:", error);
      toast({
        title: "Export failed",
        description: "Failed to export clients data",
        variant: "destructive"
      });
    }
  };

  const handleImportClick = () => {
    toast({
      title: "Import feature",
      description: "Client import functionality will be implemented soon",
    });
  };

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Error loading clients. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clients Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportClick}>
            <Import className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExportClients}>
            <FileText className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <ClientForm onComplete={handleFormComplete} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Clients</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">By Status/Tags</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Button 
                          variant={statusFilter === 'all' ? 'default' : 'outline'} 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setStatusFilter('all');
                            setIsFilterOpen(false);
                          }}
                        >
                          All Clients
                        </Button>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant={statusFilter === 'VIP' ? 'default' : 'outline'} 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setStatusFilter('VIP');
                            setIsFilterOpen(false);
                          }}
                        >
                          VIP Clients
                        </Button>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant={statusFilter === 'Premium' ? 'default' : 'outline'} 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setStatusFilter('Premium');
                            setIsFilterOpen(false);
                          }}
                        >
                          Premium Clients
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <ActiveFilterBadges 
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-6 text-center">Loading clients...</div>
          ) : filteredClients.length === 0 ? (
            <div className="py-6 text-center">
              {searchTerm || statusFilter !== 'all' ? 'No clients match your search or filters.' : 'No clients available. Add your first client!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name & Contact</TableHead>
                    <TableHead>Company & Address</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Renewal Date</TableHead>
                    <TableHead>Plan Details</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div 
                          className="flex flex-col cursor-pointer"
                          onClick={() => handleViewClient(client)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {client.avatar_url ? (
                                <img 
                                  src={client.avatar_url} 
                                  alt={client.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <UserRound className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <span className="font-medium">{client.name}</span>
                          </div>
                          {client.tags && client.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1 ml-10">
                              {client.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="ml-10 mt-1 text-sm text-gray-500 space-y-1">
                            {client.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{client.email}</span>
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{client.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{client.company || '-'}</div>
                          {client.address && (
                            <div className="text-sm text-gray-500">{client.address}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(client.join_date)}</TableCell>
                      <TableCell>{formatDate(client.renewal_date)}</TableCell>
                      <TableCell>{client.plan_details || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            title="Message client"
                            onClick={() => handleMessage(client)}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {viewingClient && (
            <ClientForm 
              client={viewingClient} 
              onComplete={handleFormComplete} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
