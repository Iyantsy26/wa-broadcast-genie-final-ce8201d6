
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Phone, Mail } from 'lucide-react';
import { Client } from "@/types/client";
import ClientNotes from "./ClientNotes";

interface ClientDetailsProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (client: Client) => void;
  onUpdateClient: (updatedClient: Client) => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({
  client,
  isOpen,
  onClose,
  onEdit,
  onUpdateClient
}) => {
  if (!client) return null;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Client Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Client header section */}
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            <Avatar className="w-20 h-20 border-2 border-primary/10">
              <AvatarImage src={client.avatar || undefined} />
              <AvatarFallback className="text-xl bg-primary/10">
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <h3 className="text-xl font-semibold">{client.name}</h3>
              <div className="text-sm text-muted-foreground">
                {client.position}{client.position && client.company ? ' at ' : ''}{client.company}
              </div>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
                {getStatusBadge(client.status)}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {client.phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${client.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </a>
                  </Button>
                )}
                
                {client.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${client.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </a>
                  </Button>
                )}
                
                <Button variant="outline" size="sm" onClick={() => onEdit(client)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
          
          {/* Tabs section */}
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="notes">Notes & Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div>{client.email || '—'}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div>{client.phone || '—'}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Company</div>
                  <div>{client.company || '—'}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Position</div>
                  <div>{client.position || '—'}</div>
                </div>
                
                <div className="col-span-full space-y-1">
                  <div className="text-sm text-muted-foreground">Notes</div>
                  <div className="whitespace-pre-wrap">{client.notes || '—'}</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="pt-4">
              <ClientNotes 
                client={client}
                onUpdateClient={onUpdateClient}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetails;
