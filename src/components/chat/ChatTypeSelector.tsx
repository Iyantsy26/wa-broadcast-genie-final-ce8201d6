
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChatType } from '@/types/conversation';
import { MessageCircle, Users, UserRound, Building2 } from 'lucide-react';

interface ChatTypeSelectorProps {
  chatTypeFilter: ChatType | 'all';
  setChatTypeFilter: (type: ChatType | 'all') => void;
}

export const ChatTypeSelector: React.FC<ChatTypeSelectorProps> = ({
  chatTypeFilter,
  setChatTypeFilter
}) => {
  return (
    <div className="flex bg-muted rounded-md p-1">
      <Button
        variant={chatTypeFilter === 'all' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          console.log('Setting chat type filter to: all');
          setChatTypeFilter('all');
        }}
        className="rounded-sm px-3"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        All
      </Button>
      <Button
        variant={chatTypeFilter === 'team' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          console.log('Setting chat type filter to: team');
          setChatTypeFilter('team');
        }}
        className="rounded-sm px-3"
      >
        <Users className="h-4 w-4 mr-2" />
        Team
      </Button>
      <Button
        variant={chatTypeFilter === 'lead' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          console.log('Setting chat type filter to: lead');
          setChatTypeFilter('lead');
        }}
        className="rounded-sm px-3"
      >
        <UserRound className="h-4 w-4 mr-2" />
        Leads
      </Button>
      <Button
        variant={chatTypeFilter === 'client' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          console.log('Setting chat type filter to: client');
          setChatTypeFilter('client');
        }}
        className="rounded-sm px-3"
      >
        <Building2 className="h-4 w-4 mr-2" />
        Clients
      </Button>
    </div>
  );
};
