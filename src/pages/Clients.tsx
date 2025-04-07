
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Client } from '@/types/conversation';
import { format } from 'date-fns';
import ClientsTable from '@/components/clients/ClientsTable';
import { useQuery } from '@tanstack/react-query';
import { getClients } from '@/services/clientService';
import { toast } from '@/hooks/use-toast';
import { ConversationProvider } from '@/contexts/ConversationContext';

const Clients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const {
    data: clients = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  
  const handleViewClient = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };
  
  // This function will be used to start a conversation with a client
  const handleMessageClient = async (client: Client): Promise<void> => {
    // Store client data in sessionStorage to be picked up by the Conversations page
    sessionStorage.setItem('selectedContactId', client.id);
    
    // Navigate to conversations page
    navigate('/conversations');
    
    toast({
      title: 'Conversation opened',
      description: `Chat with ${client.name} started.`,
    });
    
    // Return a resolved promise to satisfy the Promise<void> return type
    return Promise.resolve();
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  if (isError) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <h3 className="text-lg font-semibold mb-2">Error loading clients</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground">
          Manage your client database and communication
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="past_due">Past Due</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Card className="border shadow-sm rounded-lg">
        <ClientsTable
          clients={clients}
          isLoading={isLoading}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onViewClient={handleViewClient}
          onMessageClient={handleMessageClient}
          formatDate={formatDate}
        />
      </Card>
    </div>
  );
};

// Wrap the Clients component with the ConversationProvider
const ClientsWithConversationProvider = () => {
  return (
    <ConversationProvider>
      <Clients />
    </ConversationProvider>
  );
};

export default ClientsWithConversationProvider;
