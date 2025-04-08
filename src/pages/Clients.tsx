
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getClients } from '@/services/clientService';
import { Client } from '@/types/conversation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createConversation } from '@/services/conversationService';
import { toast } from '@/hooks/use-toast';
import ClientForm from '@/components/clients/ClientForm';
import ClientsHeader from '@/components/clients/ClientsHeader';
import ClientsSearchFilter from '@/components/clients/ClientsSearchFilter';
import ClientsTable from '@/components/clients/ClientsTable';

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
      // Get filtered clients for export
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

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Error loading clients. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <ClientsHeader onAddClient={() => setIsAddDialogOpen(true)} />

      <ClientsSearchFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onExportClients={handleExportClients}
      />

      <div className="bg-white rounded-lg border shadow">
        <ClientsTable 
          clients={clients}
          isLoading={isLoading}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onViewClient={handleViewClient}
          onMessageClient={handleMessage}
          formatDate={formatDate}
        />
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
