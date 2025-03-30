
import React from 'react';
import { format } from 'date-fns';
import { MessageSquare, Mail, Phone, MoreVertical } from 'lucide-react';
import { Lead } from '@/types/conversation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';
import { createConversation } from '@/services/conversationService';

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
  const filteredLeads = leads.filter((lead) => {
    // Filter by search term
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.source?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'yyyy-MM-dd');
  };

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
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Name</th>
              <th className="text-left font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Contact</th>
              <th className="text-left font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Source</th>
              <th className="text-left font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
              <th className="text-left font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Created</th>
              <th className="text-left font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Last Contact</th>
              <th className="text-right py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <span>{getInitials(lead.name)}</span>
                    </div>
                    <span className="font-semibold">{lead.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col space-y-1">
                    <div>{lead.email}</div>
                    <div>{lead.phone}</div>
                  </div>
                </td>
                <td className="py-4 px-4">{lead.source || '-'}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="py-4 px-4">{formatDate(lead.created_at)}</td>
                <td className="py-4 px-4">{formatDate(lead.last_contact)}</td>
                <td className="py-4 px-4">
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsTable;
