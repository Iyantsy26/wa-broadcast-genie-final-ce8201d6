import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Lead } from '@/types/conversation';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from 'date-fns';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';

export interface LeadsTableProps {
  leads: Lead[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (lead: Lead) => void;
  onView?: (lead: Lead) => void;
  searchTerm?: string;
  statusFilter?: string;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, loading, onDelete, onEdit, onView, searchTerm, statusFilter }) => {
  const navigate = useNavigate();
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
  };

  const handleDelete = async (id: string) => {
    setLeadToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (leadToDelete) {
      try {
        await onDelete(leadToDelete);
        toast({
          title: "Lead deleted",
          description: "The lead has been successfully deleted",
        });
        setShowDeleteDialog(false);
        setLeadToDelete(null);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete the lead",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-purple-100 text-purple-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'proposal':
        return 'bg-amber-100 text-amber-800';
      case 'negotiation':
        return 'bg-orange-100 text-orange-800';
      case 'won':
        return 'bg-emerald-100 text-emerald-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'nurturing':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Next Follow-up</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="flex flex-col items-center justify-center">
                  <User className="h-8 w-8 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">No leads found</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Get started by creating a new lead
                  </p>
                  <Button onClick={() => navigate('/leads/new')}>
                    Add New Lead
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            leads.map(lead => (
              <TableRow key={lead.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={lead.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(lead.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {lead.email && (
                          <a 
                            href={`mailto:${lead.email}`}
                            className="flex items-center hover:text-primary"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            {lead.email}
                          </a>
                        )}
                        {lead.phone && (
                          <a 
                            href={`tel:${lead.phone}`}
                            className="flex items-center hover:text-primary"
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            {lead.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusBadgeColor(lead.status)}`}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>{lead.company || '-'}</TableCell>
                <TableCell>{lead.source || '-'}</TableCell>
                <TableCell>
                  {lead.created_at ? format(new Date(lead.created_at), 'MMM d, yyyy') : '-'}
                </TableCell>
                <TableCell>
                  {lead.next_followup ? (
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      {format(new Date(lead.next_followup), 'MMM d, yyyy')}
                    </div>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(lead)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {editingLead && (
        <Dialog open={!!editingLead} onOpenChange={(open) => !open && setEditingLead(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
              <DialogDescription>
                Update lead information. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <LeadForm 
              lead={editingLead} 
              onComplete={() => {
                setEditingLead(null);
                onEdit && onEdit(editingLead);
              }} 
            />
          </DialogContent>
        </Dialog>
      )}

      <DeleteConfirmDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone."
      />
    </>
  );
};

export default LeadsTable;
