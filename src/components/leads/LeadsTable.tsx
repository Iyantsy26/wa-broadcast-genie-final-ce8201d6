
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ExternalLink,
  Mail,
  Phone,
  User,
  Calendar
} from 'lucide-react';
import { Lead } from '@/types/conversation';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { toast } from '@/hooks/use-toast';

export interface LeadsTableProps {
  leads: Lead[];
  searchTerm: string;
  statusFilter: string;
  loading?: boolean;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ 
  leads, 
  searchTerm, 
  statusFilter,
  loading = false
}) => {
  const navigate = useNavigate(); // Using react-router's navigate instead of Next's router
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedLead) return;
    
    setIsDeleting(true);
    
    try {
      // Delete logic would go here
      
      // Success toast
      toast({
        title: "Lead deleted",
        description: `${selectedLead.name} has been deleted successfully.`
      });
    } catch (error) {
      // Error toast
      toast({
        title: "Error",
        description: "Failed to delete lead. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedLead(null);
    }
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    // Filter by search term (name or email)
    const matchesSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
    // Filter by status
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Last Contact</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLeads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <User size={40} strokeWidth={1.5} className="mb-2 opacity-50" />
                  <p className="mb-1 font-medium">No leads found</p>
                  <p className="text-sm">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your filters'
                      : 'Add your first lead to get started'}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={lead.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {lead.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {lead.company}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {lead.email ? (
                    <div className="flex items-center gap-1">
                      <Mail size={14} className="text-muted-foreground" />
                      <span>{lead.email}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No email</span>
                  )}
                </TableCell>
                <TableCell>
                  {lead.phone ? (
                    <div className="flex items-center gap-1">
                      <Phone size={14} className="text-muted-foreground" />
                      <span>{lead.phone}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No phone</span>
                  )}
                </TableCell>
                <TableCell>
                  {lead.status === 'New' ? (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">New</Badge>
                  ) : (
                    <Badge>{lead.status}</Badge>
                  )}
                </TableCell>
                <TableCell>{lead.source || 'Direct'}</TableCell>
                <TableCell>{lead.last_contact ? (
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-muted-foreground" />
                    <span>{new Date(lead.last_contact).toLocaleDateString()}</span>
                  </div>
                ) : 'Never'}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
                          <ExternalLink className="mr-2 h-4 w-4" /> View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedLead(lead);
                          setIsEditDialogOpen(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit lead
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10"
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Edit lead dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Make changes to this lead's information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* The actual form would be imported and used here */}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
        title="Delete Lead"
        description={`Are you sure you want to delete ${selectedLead?.name}? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default LeadsTable;
