
import React, { useState, useEffect } from 'react';
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
import { getLeads, deleteLead } from '@/services/leadService';
import { Lead } from '@/types/conversation';
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
import LeadForm from '@/components/leads/LeadForm';

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Fetch leads
  const { 
    data: leads = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['leads'],
    queryFn: getLeads
  });

  // Filter leads based on search term
  const filteredLeads = leads.filter((lead) => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lead.phone && lead.phone.includes(searchTerm))
  );

  // Handle lead deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(id);
        refetch();
        toast({
          title: "Lead deleted",
          description: "The lead has been successfully deleted.",
        });
      } catch (error) {
        console.error("Error deleting lead:", error);
        toast({
          title: "Error",
          description: "Failed to delete the lead.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle form submission completion
  const handleFormComplete = () => {
    setIsAddDialogOpen(false);
    setEditingLead(null);
    refetch();
  };

  // Status color mapping for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500';
      case 'Connected':
        return 'bg-yellow-500';
      case 'Qualified':
        return 'bg-purple-500';
      case 'Proposal':
        return 'bg-orange-500';
      case 'Converted':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Error loading leads. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leads Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <LeadForm onComplete={handleFormComplete} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Leads</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-6 text-center">Loading leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="py-6 text-center">
              {searchTerm ? 'No leads match your search.' : 'No leads available. Add your first lead!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {lead.avatar_url ? (
                              <img 
                                src={lead.avatar_url} 
                                alt={lead.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserRound className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <span>{lead.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{lead.company || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.source || '-'}
                        {lead.referrer_name && <div className="text-xs text-gray-500">
                          Referrer: {lead.referrer_name}
                        </div>}
                      </TableCell>
                      <TableCell>{formatDate(lead.created_at)}</TableCell>
                      <TableCell>{formatDate(lead.last_contact)}</TableCell>
                      <TableCell>{formatDate(lead.next_followup)}</TableCell>
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
                                onClick={() => setEditingLead(lead)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Edit Lead</DialogTitle>
                              </DialogHeader>
                              {editingLead && (
                                <LeadForm 
                                  lead={editingLead} 
                                  onComplete={handleFormComplete} 
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={() => handleDelete(lead.id)}
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

export default Leads;
