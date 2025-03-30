
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, MessageSquare, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ClientNotes from './ClientNotes';
import { Client } from '@/types/client';
import { useNavigate } from 'react-router-dom';
import { createConversation } from '@/services/conversationService';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ClientDetailsProps {
  client: Client;
  onEdit: () => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onEdit }) => {
  const navigate = useNavigate();

  const handleSendMessage = async () => {
    try {
      // Create a new conversation with this client
      const initialMessage = `Hello ${client.name}, how can I assist you today?`;
      await createConversation(client.id, 'client', initialMessage);
      
      // Navigate to the Conversations page
      navigate('/conversations');
      
      toast({
        title: "Conversation created",
        description: `Started a conversation with ${client.name}`,
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

  // Get tag color based on tag value
  const getTagColor = (tag: string) => {
    const tagMap: Record<string, string> = {
      'VIP': 'bg-purple-500',
      'Gold': 'bg-yellow-500',
      'Silver': 'bg-gray-400',
      'Beginner': 'bg-blue-500',
      'Premium': 'bg-green-500',
      'Enterprise': 'bg-red-500'
    };
    
    return tagMap[tag] || 'bg-primary';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Client Details</CardTitle>
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
              Edit Client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 pb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={client.avatarUrl} alt={client.name} />
              <AvatarFallback className="text-lg">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">Client Name</h3>
              <p className="text-xl font-semibold">{client.name}</p>
              
              {/* Client Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {client.tags && client.tags.map((tag, idx) => (
                  <Badge key={idx} className={`${getTagColor(tag)} text-white`}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Contact Information</h4>
              <p className="text-sm text-muted-foreground mb-1">Email: {client.email}</p>
              <p className="text-sm text-muted-foreground mb-1">Phone: {client.phone}</p>
              <p className="text-sm text-muted-foreground mb-1">Company: {client.company}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Client Details</h4>
              <p className="text-sm text-muted-foreground mb-1">Industry: {client.industry}</p>
              <p className="text-sm text-muted-foreground mb-1">Value: ${client.value.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mb-1">Since: {client.clientSince}</p>
              <p className="text-sm text-muted-foreground mb-1">Referred By: {client.referredBy || 'N/A'}</p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Subscription details if available */}
          {(client.subscriptionPlan || client.renewalDate) && (
            <>
              <div>
                <h4 className="font-medium mb-2">Subscription Details</h4>
                {client.subscriptionPlan && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Plan: {client.subscriptionPlan}
                  </p>
                )}
                {client.renewalDate && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Renewal Date: {client.renewalDate}
                  </p>
                )}
              </div>
              <Separator className="my-4" />
            </>
          )}
        </CardContent>
      </Card>
      
      <ClientNotes client={client} />
    </div>
  );
};

export default ClientDetails;
