
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Phone, Mail, Calendar } from 'lucide-react';
import { Lead } from "@/types/lead";
import LeadNotes from "./LeadNotes";

interface LeadDetailsProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onUpdateLead: (updatedLead: Lead) => void;
}

const LeadDetails: React.FC<LeadDetailsProps> = ({
  lead,
  isOpen,
  onClose,
  onEdit,
  onUpdateLead
}) => {
  if (!lead) return null;
  
  const getStatusBadge = (status: string) => {
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
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Lead header section */}
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            <Avatar className="w-20 h-20 border-2 border-primary/10">
              <AvatarImage src={lead.avatar || undefined} />
              <AvatarFallback className="text-xl bg-primary/10">
                {getInitials(lead.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <h3 className="text-xl font-semibold">{lead.name}</h3>
              <div className="text-sm text-muted-foreground">
                {lead.position}{lead.position && lead.company ? ' at ' : ''}{lead.company}
              </div>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
                {getStatusBadge(lead.status)}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {lead.phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${lead.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </a>
                  </Button>
                )}
                
                {lead.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${lead.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </a>
                  </Button>
                )}
                
                <Button variant="outline" size="sm" onClick={() => onEdit(lead)}>
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
                  <div>{lead.email || '—'}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div>{lead.phone || '—'}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Company</div>
                  <div>{lead.company || '—'}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Position</div>
                  <div>{lead.position || '—'}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Source</div>
                  <div className="capitalize">{lead.source?.replace(/_/g, ' ') || '—'}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Next Follow-up</div>
                  <div className="flex items-center">
                    {lead.nextFollowUp ? (
                      <>
                        <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        {formatDate(lead.nextFollowUp)}
                      </>
                    ) : '—'}
                  </div>
                </div>
                
                <div className="col-span-full space-y-1">
                  <div className="text-sm text-muted-foreground">Notes</div>
                  <div className="whitespace-pre-wrap">{lead.notes || '—'}</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="pt-4">
              <LeadNotes 
                lead={lead}
                onUpdateLead={onUpdateLead}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetails;
