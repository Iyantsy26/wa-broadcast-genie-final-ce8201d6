
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MessageCircle, 
  UserRound,
  Filter,
  Import,
  FileText,
  ChevronDown,
  Calendar
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ClientForm from '@/components/clients/ClientForm';
import { createConversation } from '@/services/conversationService';
import { toast } from '@/hooks/use-toast';

const Clients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

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
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">CLIENTS</h1>
        <Button className="bg-green-600 hover:bg-green-700" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add New Client
        </Button>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <div className="relative flex-grow max-w-xs">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            className="pl-10 h-12 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
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
          <Button variant="outline" className="h-12 px-5 border-gray-300" onClick={handleExportClients}>
            <FileText className="mr-2 h-5 w-5" />
            Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow">
        {isLoading ? (
          <div className="py-10 text-center">Loading clients...</div>
        ) : filteredClients.length === 0 ? (
          <div className="py-10 text-center">
            {searchTerm || statusFilter !== 'all' ? 'No clients match your search or filters.' : 'No clients available. Add your first client!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="py-4 font-semibold text-gray-700">NAME</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">CONTACT</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">COMPANY</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">ADDRESS</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">PLAN DETAILS</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">LAST CONTACT</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow 
                    key={client.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewClient(client)}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {client.avatar_url ? (
                            <img 
                              src={client.avatar_url} 
                              alt={client.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-600 font-semibold">
                              {client.name.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{client.name}</div>
                          {client.tags && client.tags.length > 0 && (
                            <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
                              {client.tags[0]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1 text-sm">
                        {client.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {client.company || "-"}
                    </TableCell>
                    <TableCell className="py-4">
                      {client.address || "-"}
                    </TableCell>
                    <TableCell className="py-4">
                      {client.plan_details || "-"}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{formatDate(client.join_date)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 rounded-full text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMessage(client);
                          }}
                        >
                          <MessageCircle className="h-5 w-5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 rounded-full text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add email action
                            toast({
                              title: "Email action",
                              description: "Email functionality will be implemented soon",
                            });
                          }}
                        >
                          <Mail className="h-5 w-5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 rounded-full text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add phone action
                            toast({
                              title: "Call action",
                              description: "Call functionality will be implemented soon",
                            });
                          }}
                        >
                          <Phone className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <ClientForm onComplete={handleFormComplete} />
        </DialogContent>
      </Dialog>

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
