
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  UserPlus,
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  Search,
  Filter,
  Calendar,
  MessageSquare,
  UserCheck,
  BarChart3,
  Upload,
  Edit,
  Trash2,
  ClipboardList,
  Clock,
  CalendarCheck,
  Briefcase,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from '@/components/ui/progress';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted';
  source: string;
  created: string;
  lastContact: string;
  nextFollowUp: string;
  assignedTo: string;
}

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  plan: 'starter' | 'professional' | 'enterprise';
  referredBy: string;
  joinDate: string;
  renewalDate: string;
}

const leads: Lead[] = [
  {
    id: '1',
    name: 'Michael Johnson',
    company: 'Acme Corp',
    email: 'michael@acmecorp.com',
    phone: '+1 (555) 123-4567',
    status: 'qualified',
    source: 'Website',
    created: '2023-06-10T14:30:00Z',
    lastContact: '2023-06-15T09:45:00Z',
    nextFollowUp: '2023-06-22T10:00:00Z',
    assignedTo: 'Sarah Miller',
  },
  {
    id: '2',
    name: 'Jennifer Lee',
    company: 'Tech Solutions Inc',
    email: 'jennifer@techsolutions.com',
    phone: '+1 (555) 987-6543',
    status: 'contacted',
    source: 'LinkedIn',
    created: '2023-06-12T11:20:00Z',
    lastContact: '2023-06-14T15:30:00Z',
    nextFollowUp: '2023-06-21T14:00:00Z',
    assignedTo: 'Robert Brown',
  },
  {
    id: '3',
    name: 'David Wilson',
    company: 'Global Industries',
    email: 'david@globalind.com',
    phone: '+1 (555) 456-7890',
    status: 'new',
    source: 'Referral',
    created: '2023-06-16T09:00:00Z',
    lastContact: '',
    nextFollowUp: '2023-06-20T11:30:00Z',
    assignedTo: 'Unassigned',
  },
  {
    id: '4',
    name: 'Emily Parker',
    company: 'Parker Designs',
    email: 'emily@parkerdesigns.com',
    phone: '+1 (555) 789-0123',
    status: 'proposal',
    source: 'Trade Show',
    created: '2023-06-05T16:45:00Z',
    lastContact: '2023-06-18T13:15:00Z',
    nextFollowUp: '2023-06-24T15:30:00Z',
    assignedTo: 'Sarah Miller',
  },
  {
    id: '5',
    name: 'Robert Chen',
    company: 'Innovate Solutions',
    email: 'robert@innovatesol.com',
    phone: '+1 (555) 234-5678',
    status: 'converted',
    source: 'Google Ads',
    created: '2023-05-28T10:30:00Z',
    lastContact: '2023-06-17T11:45:00Z',
    nextFollowUp: '',
    assignedTo: 'Robert Brown',
  },
];

const clients: Client[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    company: 'Acme Corp',
    email: 'contact@acmecorp.com',
    phone: '+1 (555) 111-2233',
    plan: 'professional',
    referredBy: 'Trade Show',
    joinDate: '2023-01-15T00:00:00Z',
    renewalDate: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Global Enterprises',
    company: 'Global Ent',
    email: 'info@globalent.com',
    phone: '+1 (555) 444-5555',
    plan: 'enterprise',
    referredBy: 'Website',
    joinDate: '2023-03-10T00:00:00Z',
    renewalDate: '2024-03-10T00:00:00Z',
  },
  {
    id: '3',
    name: 'Tech Innovations',
    company: 'Tech Innovations Ltd',
    email: 'contact@techinnovations.com',
    phone: '+1 (555) 777-8888',
    plan: 'starter',
    referredBy: 'Robert Chen',
    joinDate: '2023-05-20T00:00:00Z',
    renewalDate: '2024-05-20T00:00:00Z',
  },
];

const LeadsCRM = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('leads');
  const [newLeadDialogOpen, setNewLeadDialogOpen] = useState(false);
  const [newClientDialogOpen, setNewClientDialogOpen] = useState(false);
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadDetailsOpen, setLeadDetailsOpen] = useState(false);

  const handleAddLead = () => {
    toast({
      title: "New lead added",
      description: "Lead has been successfully added to your CRM",
    });
    setNewLeadDialogOpen(false);
  };

  const handleAddClient = () => {
    toast({
      title: "New client added",
      description: "Client has been successfully added to your CRM",
    });
    setNewClientDialogOpen(false);
  };

  const viewLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setLeadDetailsOpen(true);
  };

  const handleCallContact = (phone: string) => {
    toast({
      title: "Calling contact",
      description: `Initiating call to ${phone}`,
    });
  };

  const handleEmailContact = (email: string) => {
    toast({
      title: "Email client",
      description: `Opening email to ${email}`,
    });
  };

  const handleMessageContact = (contact: string) => {
    toast({
      title: "Open chat",
      description: `Opening chat with ${contact}`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">New</Badge>;
      case 'contacted':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Contacted</Badge>;
      case 'qualified':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">Qualified</Badge>;
      case 'proposal':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-50">Proposal</Badge>;
      case 'converted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Converted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'starter':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Starter</Badge>;
      case 'professional':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">Professional</Badge>;
      case 'enterprise':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Enterprise</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads & Clients</h1>
          <p className="text-muted-foreground">
            Manage your leads and clients in one place
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={newLeadDialogOpen} onOpenChange={setNewLeadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
                <DialogDescription>
                  Enter the details for your new lead.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lead-name">Full Name</Label>
                    <Input id="lead-name" placeholder="e.g., John Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead-company">Company</Label>
                    <Input id="lead-company" placeholder="e.g., Acme Corp" />
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lead-email">Email</Label>
                    <Input id="lead-email" type="email" placeholder="email@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead-phone">Phone</Label>
                    <Input id="lead-phone" placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lead-status">Status</Label>
                    <Select defaultValue="new">
                      <SelectTrigger id="lead-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead-source">Source</Label>
                    <Select defaultValue="website">
                      <SelectTrigger id="lead-source">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="email">Email Campaign</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lead-assigned">Assign To</Label>
                    <Select defaultValue="sarah">
                      <SelectTrigger id="lead-assigned">
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sarah">Sarah Miller</SelectItem>
                        <SelectItem value="robert">Robert Brown</SelectItem>
                        <SelectItem value="jessica">Jessica Lee</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead-followup">Next Follow-up</Label>
                    <Input id="lead-followup" type="datetime-local" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lead-notes">Notes</Label>
                  <Textarea 
                    id="lead-notes" 
                    placeholder="Add any additional information about this lead..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewLeadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddLead}>
                  Add Lead
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={newClientDialogOpen} onOpenChange={setNewClientDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Enter the details for your new client.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input id="client-name" placeholder="e.g., Acme Corporation" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-company">Company</Label>
                    <Input id="client-company" placeholder="e.g., Acme Corp" />
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Email</Label>
                    <Input id="client-email" type="email" placeholder="contact@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-phone">Phone</Label>
                    <Input id="client-phone" placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="client-plan">Subscription Plan</Label>
                    <Select defaultValue="starter">
                      <SelectTrigger id="client-plan">
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-referred">Referred By</Label>
                    <Input id="client-referred" placeholder="e.g., John Smith or Website" />
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="client-join">Join Date</Label>
                    <Input id="client-join" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-renewal">Renewal Date</Label>
                    <Input id="client-renewal" type="date" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client-notes">Notes</Label>
                  <Textarea 
                    id="client-notes" 
                    placeholder="Add any additional information about this client..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewClientDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddClient}>
                  Add Client
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="leads" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="leads" className="relative">
              Leads
              <span className="ml-1 text-xs text-foreground/70">{leads.length}</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="relative">
              Clients
              <span className="ml-1 text-xs text-foreground/70">{clients.length}</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab}...`}
                className="pl-8 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        <TabsContent value="leads">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between">
                <div>
                  <CardTitle>All Leads</CardTitle>
                  <CardDescription>
                    View and manage all your leads
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Next Follow-up</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div 
                            className="font-medium cursor-pointer hover:text-primary hover:underline"
                            onClick={() => viewLeadDetails(lead)}
                          >
                            {lead.name}
                          </div>
                          <div className="text-xs text-muted-foreground">{lead.email}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(lead.status)}</TableCell>
                        <TableCell>{lead.company}</TableCell>
                        <TableCell>{lead.source}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {lead.assignedTo !== 'Unassigned' ? (
                              <>
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                                  {lead.assignedTo.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="text-sm">{lead.assignedTo}</span>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">Unassigned</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.nextFollowUp ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">
                                {new Date(lead.nextFollowUp).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not scheduled</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleCallContact(lead.phone)}
                              title="Call"
                            >
                              <Phone className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEmailContact(lead.email)}
                              title="Email"
                            >
                              <Mail className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleMessageContact(lead.name)}
                              title="Message"
                            >
                              <MessageSquare className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => viewLeadDetails(lead)}
                              title="View Details"
                            >
                              <ClipboardList className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clients">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between">
                <div>
                  <CardTitle>All Clients</CardTitle>
                  <CardDescription>
                    View and manage all your clients
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Plans</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Referred By</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Renewal</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="font-medium cursor-pointer hover:text-primary hover:underline">
                            {client.name}
                          </div>
                          <div className="text-xs text-muted-foreground">{client.company}</div>
                        </TableCell>
                        <TableCell>{getPlanBadge(client.plan)}</TableCell>
                        <TableCell>
                          <div className="text-sm">{client.email}</div>
                          <div className="text-xs text-muted-foreground">{client.phone}</div>
                        </TableCell>
                        <TableCell>{client.referredBy}</TableCell>
                        <TableCell>
                          {new Date(client.joinDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(client.renewalDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleCallContact(client.phone)}
                              title="Call"
                            >
                              <Phone className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEmailContact(client.email)}
                              title="Email"
                            >
                              <Mail className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleMessageContact(client.name)}
                              title="Message"
                            >
                              <MessageSquare className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="View Details"
                            >
                              <ClipboardList className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={leadDetailsOpen} onOpenChange={setLeadDetailsOpen}>
        {selectedLead && (
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedLead.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(selectedLead.status)}
                <span className="text-sm text-muted-foreground">
                  Created on {new Date(selectedLead.created).toLocaleDateString()}
                </span>
              </div>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLead.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLead.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLead.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Lead Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 mt-0.5">
                          <UserPlus className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">Source</div>
                          <div className="text-sm text-muted-foreground">{selectedLead.source}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 mt-0.5">
                          <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">Assigned To</div>
                          <div className="text-sm text-muted-foreground">{selectedLead.assignedTo}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Status Timeline</h3>
                    <div className="relative pl-6 border-l border-border space-y-4">
                      <div className="relative">
                        <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-blue-500"></div>
                        <div className="font-medium">Created</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(selectedLead.created).toLocaleDateString()} at {new Date(selectedLead.created).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      {selectedLead.status !== 'new' && (
                        <div className="relative">
                          <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-yellow-500"></div>
                          <div className="font-medium">Contacted</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedLead.lastContact ? new Date(selectedLead.lastContact).toLocaleDateString() : 'Date not recorded'}
                          </div>
                        </div>
                      )}
                      
                      {(selectedLead.status === 'qualified' || selectedLead.status === 'proposal' || selectedLead.status === 'converted') && (
                        <div className="relative">
                          <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-purple-500"></div>
                          <div className="font-medium">Qualified</div>
                          <div className="text-sm text-muted-foreground">Date not recorded</div>
                        </div>
                      )}
                      
                      {(selectedLead.status === 'proposal' || selectedLead.status === 'converted') && (
                        <div className="relative">
                          <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-orange-500"></div>
                          <div className="font-medium">Proposal Sent</div>
                          <div className="text-sm text-muted-foreground">Date not recorded</div>
                        </div>
                      )}
                      
                      {selectedLead.status === 'converted' && (
                        <div className="relative">
                          <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-green-500"></div>
                          <div className="font-medium">Converted to Client</div>
                          <div className="text-sm text-muted-foreground">Date not recorded</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedLead.nextFollowUp && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Next Follow-up</h3>
                      <div className="p-3 border rounded-md bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {new Date(selectedLead.nextFollowUp).toLocaleDateString()} at {new Date(selectedLead.nextFollowUp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Follow-up call to discuss requirements
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Lead Conversion Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Progress</span>
                    <span>
                      {selectedLead.status === 'new' ? '20%' : 
                       selectedLead.status === 'contacted' ? '40%' : 
                       selectedLead.status === 'qualified' ? '60%' : 
                       selectedLead.status === 'proposal' ? '80%' : 
                       '100%'}
                    </span>
                  </div>
                  <Progress value={
                    selectedLead.status === 'new' ? 20 : 
                    selectedLead.status === 'contacted' ? 40 : 
                    selectedLead.status === 'qualified' ? 60 : 
                    selectedLead.status === 'proposal' ? 80 : 
                    100
                  } />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes & Activity</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">Initial Contact</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedLead.lastContact ? new Date(selectedLead.lastContact).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <p className="text-sm mt-1">
                      Initial call to understand requirements. Lead expressed interest in our WhatsApp broadcasting solution.
                    </p>
                  </div>
                  
                  {selectedLead.status !== 'new' && (
                    <div className="p-3 border rounded-md">
                      <div className="flex justify-between items-start">
                        <div className="font-medium">Follow-up Email</div>
                        <div className="text-xs text-muted-foreground">
                          {selectedLead.lastContact ? 
                            new Date(new Date(selectedLead.lastContact).getTime() + 24*60*60*1000).toLocaleDateString() : 
                            'N/A'}
                        </div>
                      </div>
                      <p className="text-sm mt-1">
                        Sent product information and pricing details as requested.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Edit Lead
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-3.5 w-3.5" />
                  Schedule Follow-up
                </Button>
                <Button size="sm">
                  <Send className="mr-2 h-3.5 w-3.5" />
                  Send Message
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default LeadsCRM;
