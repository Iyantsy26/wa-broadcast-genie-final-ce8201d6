
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Phone, 
  Mail, 
  Calendar,
  Edit,
  ListFilter,
  Plus,
  UserRound,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";
import { Client } from "@/types/client";
import { Lead } from "@/types/lead";
import LeadForm from "@/components/leads/LeadForm";
import LeadDetails from "@/components/leads/LeadDetails";
import ClientForm from "@/components/clients/ClientForm";
import ClientDetails from "@/components/clients/ClientDetails";

// Mock data
const initialLeads: Lead[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    company: "Acme Inc.",
    position: "Marketing Director",
    source: "website",
    status: "new",
    nextFollowUp: "2023-10-15",
    notes: "Interested in our premium package",
    createdAt: "2023-09-28T14:30:00Z",
    updatedAt: "2023-09-28T14:30:00Z",
    activities: [
      {
        id: "a1",
        type: "status_change",
        content: "Status changed from New to Contacted",
        timestamp: "2023-09-29T10:15:00Z",
        createdBy: "Admin User"
      },
      {
        id: "a2",
        type: "note",
        content: "Called and left a voicemail",
        timestamp: "2023-09-29T10:20:00Z",
        createdBy: "Admin User"
      },
      {
        id: "a3",
        type: "follow_up_scheduled",
        content: "Follow-up scheduled for October 15, 2023",
        timestamp: "2023-09-29T10:25:00Z",
        createdBy: "Admin User"
      }
    ]
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1 (555) 987-6543",
    company: "Johnson & Co",
    position: "CEO",
    source: "referral",
    status: "qualified",
    nextFollowUp: "2023-10-20",
    notes: "Wants a demo of our enterprise solution",
    createdAt: "2023-09-25T09:15:00Z",
    updatedAt: "2023-09-27T16:45:00Z",
    activities: [
      {
        id: "b1",
        type: "note",
        content: "Sent product brochure via email",
        timestamp: "2023-09-26T11:30:00Z",
        createdBy: "Admin User"
      },
      {
        id: "b2",
        type: "status_change",
        content: "Status changed from New to Qualified",
        timestamp: "2023-09-27T16:45:00Z",
        createdBy: "Admin User"
      }
    ]
  },
  // Add more mock data as needed
];

const initialClients: Client[] = [
  {
    id: "c1",
    name: "Acme Corporation",
    email: "info@acmecorp.com",
    phone: "+1 (555) 111-2233",
    company: "Acme Corporation",
    position: "Client",
    status: "active",
    notes: "Our first major enterprise client",
    createdAt: "2023-08-15T10:00:00Z",
    updatedAt: "2023-09-01T14:30:00Z",
    activities: [
      {
        id: "ca1",
        type: "note",
        content: "Quarterly review meeting scheduled",
        timestamp: "2023-09-01T14:30:00Z",
        createdBy: "Admin User"
      },
      {
        id: "ca2",
        type: "status_change",
        content: "Status changed from Pending to Active",
        timestamp: "2023-08-20T11:15:00Z",
        createdBy: "Admin User"
      }
    ]
  },
  {
    id: "c2",
    name: "Globex Industries",
    email: "contact@globex.com",
    phone: "+1 (555) 444-5555",
    company: "Globex Industries",
    position: "Client",
    status: "active",
    notes: "Renewed annual contract",
    createdAt: "2023-07-10T09:45:00Z",
    updatedAt: "2023-08-05T16:20:00Z",
    activities: [
      {
        id: "cb1",
        type: "note",
        content: "Discussed expansion to international offices",
        timestamp: "2023-08-05T16:20:00Z",
        createdBy: "Admin User"
      }
    ]
  },
  // Add more mock data as needed
];

const LeadsCRM = () => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadDetailsOpen, setIsLeadDetailsOpen] = useState(false);
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);
  
  // Filter leads based on search term
  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddLead = () => {
    setEditingLead(undefined);
    setIsLeadFormOpen(true);
  };
  
  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsLeadFormOpen(true);
  };
  
  const handleSaveLead = (lead: Lead) => {
    if (editingLead) {
      setLeads(leads.map(l => l.id === lead.id ? lead : l));
    } else {
      setLeads([...leads, lead]);
    }
  };
  
  const handleViewLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsLeadDetailsOpen(true);
  };
  
  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
    setSelectedLead(updatedLead);
  };
  
  const handleAddClient = () => {
    setEditingClient(undefined);
    setIsClientFormOpen(true);
  };
  
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsClientFormOpen(true);
  };
  
  const handleSaveClient = (client: Client) => {
    if (editingClient) {
      setClients(clients.map(c => c.id === client.id ? client : c));
    } else {
      setClients([...clients, client]);
    }
  };
  
  const handleViewClientDetails = (client: Client) => {
    setSelectedClient(client);
    setIsClientDetailsOpen(true);
  };
  
  const handleUpdateClient = (updatedClient: Client) => {
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
    setSelectedClient(updatedClient);
  };
  
  const getLeadStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">New</Badge>;
      case 'contacted':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Contacted</Badge>;
      case 'qualified':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Qualified</Badge>;
      case 'proposal':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Proposal</Badge>;
      case 'negotiation':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Negotiation</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">Closed</Badge>;
      case 'lost':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Lost</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getClientStatusBadge = (status: string) => {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
        <p className="text-muted-foreground">
          Manage your leads and clients in one place
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search leads and clients..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button variant="outline" size="icon">
          <ListFilter className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="leads">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger 
            value="leads" 
            className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800"
          >
            <UserRound className="mr-2 h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger 
            value="clients"
            className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Clients
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Leads</h2>
            <Button onClick={handleAddLead}>
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Follow-up</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={lead.avatar || undefined} />
                            <AvatarFallback className="bg-primary/10">
                              {getInitials(lead.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div 
                              className="font-medium hover:underline cursor-pointer"
                              onClick={() => handleViewLeadDetails(lead)}
                            >
                              {lead.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {lead.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.company || '—'}
                        {lead.position && <div className="text-xs text-muted-foreground">{lead.position}</div>}
                      </TableCell>
                      <TableCell>
                        {getLeadStatusBadge(lead.status)}
                      </TableCell>
                      <TableCell>
                        {lead.nextFollowUp ? (
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            {format(new Date(lead.nextFollowUp), "MMM d, yyyy")}
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditLead(lead)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {lead.phone && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              asChild
                            >
                              <a href={`tel:${lead.phone}`}>
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {lead.email && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              asChild
                            >
                              <a href={`mailto:${lead.email}`}>
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No leads found. Try adjusting your search or add a new lead.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="clients" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Clients</h2>
            <Button onClick={handleAddClient}>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={client.avatar || undefined} />
                            <AvatarFallback className="bg-primary/10">
                              {getInitials(client.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div 
                              className="font-medium hover:underline cursor-pointer"
                              onClick={() => handleViewClientDetails(client)}
                            >
                              {client.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {client.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.company || '—'}
                        {client.position && client.position !== 'Client' && (
                          <div className="text-xs text-muted-foreground">{client.position}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getClientStatusBadge(client.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {client.phone && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              asChild
                            >
                              <a href={`tel:${client.phone}`}>
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {client.email && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              asChild
                            >
                              <a href={`mailto:${client.email}`}>
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      No clients found. Try adjusting your search or add a new client.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Forms and Detail Modals */}
      <LeadForm 
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        onSave={handleSaveLead}
        lead={editingLead}
      />
      
      <LeadDetails 
        lead={selectedLead}
        isOpen={isLeadDetailsOpen}
        onClose={() => setIsLeadDetailsOpen(false)}
        onEdit={handleEditLead}
        onUpdateLead={handleUpdateLead}
      />
      
      <ClientForm 
        isOpen={isClientFormOpen}
        onClose={() => setIsClientFormOpen(false)}
        onSave={handleSaveClient}
        client={editingClient}
      />
      
      <ClientDetails 
        client={selectedClient}
        isOpen={isClientDetailsOpen}
        onClose={() => setIsClientDetailsOpen(false)}
        onEdit={handleEditClient}
        onUpdateClient={handleUpdateClient}
      />
    </div>
  );
};

export default LeadsCRM;
