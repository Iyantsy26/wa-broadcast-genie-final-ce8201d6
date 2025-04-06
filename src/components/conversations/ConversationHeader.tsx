
import React from 'react';
import { Conversation } from '@/types/conversation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Phone,
  Video,
  Search,
  Info,
  Building2,
  UserRound,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConversationHeaderProps {
  conversation: Conversation;
  onOpenContactInfo: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ 
  conversation,
  onOpenContactInfo
}) => {
  const contact = conversation.contact;
  
  const getContactTypeIcon = () => {
    switch (conversation.chatType) {
      case 'client':
        return <Building2 className="h-3 w-3 mr-1" />;
      case 'lead':
        return <UserRound className="h-3 w-3 mr-1" />;
      case 'team':
        return <Users className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };
  
  const getContactTypeBadgeClass = () => {
    switch (conversation.chatType) {
      case 'client':
        return 'bg-emerald-100 text-emerald-700';
      case 'lead':
        return 'bg-amber-100 text-amber-700';
      case 'team':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <div className="flex items-center justify-between p-3 border-b">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={contact.avatar} />
          <AvatarFallback>
            {contact.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <div className="font-medium flex items-center gap-1.5">
            {contact.name}
            {contact.isOnline && (
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
            )}
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Badge variant="outline" className={`px-1.5 py-0 h-4 mr-1.5 ${getContactTypeBadgeClass()}`}>
              {getContactTypeIcon()}
              {conversation.chatType.charAt(0).toUpperCase() + conversation.chatType.slice(1)}
            </Badge>
            
            {contact.phone && <span>{contact.phone}</span>}
            {!contact.phone && contact.lastSeen && (
              <span>Last seen {new Date(contact.lastSeen).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenContactInfo}>
          <Info className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mute notifications</DropdownMenuItem>
            <DropdownMenuItem>Block contact</DropdownMenuItem>
            <DropdownMenuItem>Clear chat</DropdownMenuItem>
            <DropdownMenuItem>Export chat</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete chat</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ConversationHeader;
