
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit } from 'lucide-react';
import { Lead } from '@/types/conversation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
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
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("09:00 AM");

  const timeOptions = [
    "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", 
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
  ];

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

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'hh:mm a');
    } catch (e) {
      return '';
    }
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

  const handleDateUpdate = (leadId: string, date: Date) => {
    // Here we would update the date in the backend
    toast({
      title: "Follow-up date updated",
      description: `Follow-up scheduled for ${format(date, 'MMM dd, yyyy')} at ${selectedTime}`
    });
    setShowDatePicker(null);
    setSelectedDate(null);
  };

  const handleFollowupClick = (e: React.MouseEvent, leadId: string, currentDate?: string) => {
    e.stopPropagation();
    setShowDatePicker(leadId);
    if (currentDate) {
      setSelectedDate(new Date(currentDate));
    }
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id} className="border-b hover:bg-gray-50" onClick={() => handleLeadClick(lead)}>
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
                <TableCell className="py-4 px-4">
                  <div 
                    className="cursor-pointer hover:text-blue-600" 
                    onClick={(e) => handleFollowupClick(e, lead.id, lead.next_followup)}
                  >
                    <div>{lead.next_followup ? formatDate(lead.next_followup) : '-'}</div>
                    {lead.next_followup_time && (
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {lead.next_followup_time}
                      </div>
                    )}
                  </div>
                  
                  {showDatePicker === lead.id && (
                    <Popover open={true} onOpenChange={() => setShowDatePicker(null)}>
                      <PopoverContent className="w-auto p-0 z-50" align="start">
                        <div className="p-3">
                          <Calendar
                            mode="single"
                            selected={selectedDate || undefined}
                            onSelect={(date) => setSelectedDate(date)}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                          <div className="mt-3 border-t pt-3">
                            <label className="block text-sm font-medium mb-2">Time</label>
                            <select 
                              className="w-full border rounded p-2"
                              value={selectedTime}
                              onChange={(e) => setSelectedTime(e.target.value)}
                            >
                              {timeOptions.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                            <div className="flex justify-end mt-3">
                              <Button 
                                onClick={() => setShowDatePicker(null)} 
                                variant="outline" 
                                className="mr-2"
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => selectedDate && handleDateUpdate(lead.id, selectedDate)}
                                disabled={!selectedDate}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
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
          <DialogContent className="sm:max-w-[600px]">
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
