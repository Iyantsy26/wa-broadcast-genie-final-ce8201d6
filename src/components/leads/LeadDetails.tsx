
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, MessageSquare, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import LeadNotes from './LeadNotes';
import { Lead } from '@/types/lead';
import { useNavigate } from 'react-router-dom';

interface LeadDetailsProps {
  lead: Lead;
  onEdit: () => void;
}

const LeadDetails: React.FC<LeadDetailsProps> = ({ lead, onEdit }) => {
  const navigate = useNavigate();

  const handleSendMessage = () => {
    // Navigate to the Conversations page
    navigate('/conversations');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'negotiation':
        return 'bg-amber-100 text-amber-800';
      case 'won':
        return 'bg-emerald-100 text-emerald-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Lead Details</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSendMessage}
            >
              <MessageSquare className="mr-1 h-4 w-4" />
              Send Message
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
            >
              <Edit className="mr-1 h-4 w-4" />
              Edit Lead
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 pb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={lead.avatarUrl} alt={lead.name} />
              <AvatarFallback className="text-lg">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex gap-3 items-center">
                <h3 className="text-xl font-semibold">{lead.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{lead.company}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Contact Information</h4>
              <p className="text-sm text-muted-foreground mb-1">Email: {lead.email}</p>
              <p className="text-sm text-muted-foreground mb-1">Phone: {lead.phone}</p>
              <p className="text-sm text-muted-foreground mb-1">Company: {lead.company}</p>
              <p className="text-sm text-muted-foreground mb-1">Industry: {lead.industry || 'Not specified'}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Lead Details</h4>
              <p className="text-sm text-muted-foreground mb-1">Source: {lead.source}</p>
              <p className="text-sm text-muted-foreground mb-1">Value: ${lead.value.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mb-1">Created: {lead.createdAt}</p>
              <p className="text-sm text-muted-foreground mb-1">Last Contact: {lead.lastContact || 'No contact yet'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <LeadNotes lead={lead} />
    </div>
  );
};

export default LeadDetails;
