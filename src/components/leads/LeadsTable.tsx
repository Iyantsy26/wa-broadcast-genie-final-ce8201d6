
import React, { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Mail, Phone, Edit } from 'lucide-react';
import { Lead } from '@/types/conversation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { createConversation } from '@/services/conversationService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import LeadForm from '@/components/leads/LeadForm';

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  searchTerm: string;
  statusFilter: string;
}

const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  loading,
  searchTerm,
  statusFilter
}) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const filteredLeads = leads.filter((lead) => {
    // Filter by search term
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700';
      case 'Contacted':
        return 'bg-yellow-50 text-yellow-700';
      case 'Qualified':
        return 'bg-purple-50 text-purple-700';
      case 'Proposal':
        return 'bg-indigo-50 text-indigo-700';
      case 'Converted':
        return 'bg-green-50 text-green-700';
      case 'Lost':
        return 'bg-gray-50 text-gray-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const handleMessage = async (lead: Lead) => {
    try {
      await createConversation(lead.id, 'lead', `Initial contact with ${lead.name}`);
      toast({
        title: "Action not available",
        description: "The conversation feature is currently being redesigned.",
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    }
  };

  const handleEmail = (lead: Lead) => {
    window.location.href = `mailto:${lead.email}`;
  };

  const handleCall = (lead: Lead) => {
    window.location.href = `tel:${lead.phone}`;
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailsOpen(true);
  };

  const handleEditClick = () => {
    setIsDetailsOpen(false);
    setIsEditOpen(true);
  };

  const handleEditComplete = () => {
    setIsEditOpen(false);
  };

  if (loading) {
    return <div className="py-10 text-center">Loading leads...</div>;
  }

  if (filteredLeads.length === 0) {
    return (
      <div className="py-10 text-center">
        {searchTerm || statusFilter !== 'all' 
          ? 'No leads match your search or filters.' 
          : 'No leads available. Add your first lead!'}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Name</TableHead>
              <TableHead className="font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Contact</TableHead>
              <TableHead className="font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Company</TableHead>
              <TableHead className="font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Address</TableHead>
              <TableHead className="font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Last Contact</TableHead>
              <TableHead className="font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Next Follow-up</TableHead>
              <TableHead className="text-right py-3 px-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id} className="border-b hover:bg-gray-50">
                <TableCell className="py-4 px-4">
                  <div className="flex items-center">
                    <Avatar className="w-8 h-8 mr-3">
                      {lead.avatar_url ? (
                        <AvatarImage src={lead.avatar_url} alt={lead.name} />
                      ) : (
                        <AvatarFallback>{lead.initials}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <span 
                        className="font-semibold cursor-pointer hover:text-blue-600"
                        onClick={() => handleLeadClick(lead)}
                      >
                        {lead.name}
                      </span>
                      {lead.status && (
                        <div className="mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <div className="flex flex-col space-y-1">
                    <div>{lead.email || '-'}</div>
                    <div>{lead.phone || '-'}</div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4">{lead.company || '-'}</TableCell>
                <TableCell className="py-4 px-4">{lead.address || '-'}</TableCell>
                <TableCell className="py-4 px-4">{formatDate(lead.last_contact)}</TableCell>
                <TableCell className="py-4 px-4">{formatDate(lead.next_followup)}</TableCell>
                <TableCell className="py-4 px-4">
                  <div className="flex justify-end space-x-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full text-blue-600"
                      onClick={() => handleMessage(lead)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full text-blue-600"
                      onClick={() => handleEmail(lead)}
                      disabled={!lead.email}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full text-blue-600"
                      onClick={() => handleCall(lead)}
                      disabled={!lead.phone}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-4 py-2">
              <div className="flex items-center mb-4">
                <Avatar className="w-12 h-12 mr-4">
                  {selectedLead.avatar_url ? (
                    <AvatarImage src={selectedLead.avatar_url} alt={selectedLead.name} />
                  ) : (
                    <AvatarFallback>{selectedLead.initials}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedLead.name}</h3>
                  {selectedLead.status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedLead.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedLead.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{selectedLead.company || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedLead.address || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <p className="font-medium">{selectedLead.source || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Referrer</p>
                  <p className="font-medium">{selectedLead.referrer_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Contact</p>
                  <p className="font-medium">{formatDate(selectedLead.last_contact)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Next Follow-up</p>
                  <p className="font-medium">{formatDate(selectedLead.next_followup)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">{selectedLead.created_at ? formatDate(selectedLead.created_at) : '-'}</p>
                </div>
              </div>

              {selectedLead.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="font-medium">{selectedLead.notes}</p>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button onClick={handleEditClick} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Lead
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      {selectedLead && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
            </DialogHeader>
            <LeadForm lead={selectedLead} onComplete={handleEditComplete} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default LeadsTable;
