
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  PlusCircle, 
  Search, 
  Phone, 
  Mail, 
  MessageCircle, 
  Edit, 
  Trash, 
  UserRound 
} from 'lucide-react';
import { getClients, deleteClient } from '@/services/clientService';
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
import ClientForm from '@/components/clients/ClientForm';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Fetch clients
  const { 
    data: clients = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients
  });

  // Filter clients based on search term
  const filteredClients = clients.filter((client) => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  // Handle client deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id);
        refetch();
        toast({
          title: "Client deleted",
          description: "The client has been successfully deleted.",
        });
      } catch (error) {
        console.error("Error deleting client:", error);
        toast({
          title: "Error",
          description: "Failed to delete the client.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle form submission completion
  const handleFormComplete = () => {
    setIsAddDialogOpen(false);
    setEditingClient(null);
    refetch();
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Clients</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-6 text-center">Loading clients...</div>
          ) : filteredClients.length === 0 ? (
            <div className="py-6 text-center">
              {searchTerm ? 'No clients match your search.' : 'No clients available. Add your first client!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Renewal Date</TableHead>
                    <TableHead>Plan Details</TableHead>
                    <TableHead>Referred By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
                          <span>{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{client.company || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {client.tags && client.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {!client.tags?.length && '-'}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(client.join_date)}</TableCell>
                      <TableCell>{formatDate(client.renewal_date)}</TableCell>
                      <TableCell>{client.plan_details || '-'}</TableCell>
                      <TableCell>{client.referred_by || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                onClick={() => setEditingClient(client)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Edit Client</DialogTitle>
                              </DialogHeader>
                              {editingClient && (
                                <ClientForm 
                                  client={editingClient} 
                                  onComplete={handleFormComplete} 
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={() => handleDelete(client.id)}
                          >
                            <Trash className="h-4 w-4" />
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
    </div>
  );
};

export default Clients;
