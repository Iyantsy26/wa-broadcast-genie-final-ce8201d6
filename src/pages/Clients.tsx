
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Pencil, Download, Upload } from 'lucide-react';
import ClientsHeader from '@/components/clients/ClientsHeader';

const Clients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  
  const {
    data: clients = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  
  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsOpen(true);
    setIsEditing(false);
  };
  
  const handleMessageClient = async (client: Client): Promise<void> => {
    sessionStorage.setItem('selectedContactId', client.id);
    navigate('/conversations');
    toast({
      title: 'Conversation opened',
      description: `Chat with ${client.name} started.`,
    });
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
  
  const handleAddClient = () => {
    setIsAddClientOpen(true);
  };
  
  const handleCloseClientDetails = () => {
    setIsDetailsOpen(false);
    setSelectedClient(null);
  };
  
  const handleEditClient = () => {
    setIsEditing(true);
  };
  
  const handleExportClients = () => {
    try {
      const clientsData = JSON.stringify(clients, null, 2);
      const blob = new Blob([clientsData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: 'Clients exported',
        description: `${clients.length} clients exported successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'An error occurred while exporting clients.',
        variant: 'destructive',
      });
    }
  };
  
  const handleImportClients = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedClients = JSON.parse(event.target?.result as string);
          
          console.log('Imported clients:', importedClients);
          
          toast({
            title: 'Clients imported',
            description: `${importedClients.length} clients imported successfully.`,
          });
        } catch (error) {
          toast({
            title: 'Import failed',
            description: 'The selected file is not a valid clients export.',
            variant: 'destructive',
          });
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
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
      <ClientsHeader onAddClient={handleAddClient} />
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportClients}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExportClients}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="past_due">Past Due</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
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
      
      {selectedClient && (
        <Dialog open={isDetailsOpen} onOpenChange={handleCloseClientDetails}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>{selectedClient.name}</span>
                <Button variant="ghost" size="icon" onClick={handleEditClient} className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Client avatar and basic info */}
              <div className="flex items-center space-x-4">
                {selectedClient.avatar_url ? (
                  <img src={selectedClient.avatar_url} alt={selectedClient.name} className="h-16 w-16 rounded-full" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xl font-semibold text-gray-500">
                      {selectedClient.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{selectedClient.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedClient.company || 'No company'}</p>
                </div>
              </div>
              
              {/* Contact details */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Contact Information</h4>
                <div className="grid grid-cols-[100px_1fr] gap-1">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm">{selectedClient.email || '—'}</span>
                  
                  <span className="text-sm text-muted-foreground">Phone:</span>
                  <span className="text-sm">{selectedClient.phone || '—'}</span>
                  
                  <span className="text-sm text-muted-foreground">Address:</span>
                  <span className="text-sm">{selectedClient.address || '—'}</span>
                </div>
              </div>
              
              {/* Membership details */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Membership Information</h4>
                <div className="grid grid-cols-[100px_1fr] gap-1">
                  <span className="text-sm text-muted-foreground">Join Date:</span>
                  <span className="text-sm">{formatDate(selectedClient.join_date)}</span>
                  
                  <span className="text-sm text-muted-foreground">Renewal:</span>
                  <span className="text-sm">{formatDate(selectedClient.renewal_date)}</span>
                  
                  <span className="text-sm text-muted-foreground">Plan:</span>
                  <span className="text-sm">{selectedClient.plan_details || '—'}</span>
                </div>
              </div>
              
              {/* Tags */}
              {selectedClient.tags && selectedClient.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedClient.tags.map((tag, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Notes */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Notes</h4>
                <p className="text-sm whitespace-pre-line border rounded p-3">
                  {selectedClient.notes || 'No notes available.'}
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => handleMessageClient(selectedClient)}>
                Message Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const ClientsWithConversationProvider = () => {
  return (
    <ConversationProvider>
      <Clients />
    </ConversationProvider>
  );
};

export default ClientsWithConversationProvider;
