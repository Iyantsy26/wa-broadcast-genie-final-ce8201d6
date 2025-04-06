
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  User,
  MoreVertical,
  Archive,
  Star,
  Bell,
  BellOff,
  Ban,
  Flag,
  Trash,
  MessageSquareText,
  Phone,
  Video,
} from 'lucide-react';
import { Contact } from '@/types/conversation';
import { useConversation } from '@/contexts/ConversationContext';
import { format } from 'date-fns';

export interface ConversationHeaderProps {
  contact: Contact;
  onInfoClick: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  contact,
  onInfoClick
}) => {
  const {
    toggleContactStar,
    muteContact,
    archiveContact,
    blockContact,
    reportContact,
    clearChat
  } = useConversation();
  
  const getContactTypeColor = () => {
    switch (contact.type) {
      case 'team':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'client':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'lead':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getLastSeenText = () => {
    if (contact.isOnline) {
      return 'Online';
    }
    
    if (contact.lastSeen) {
      const lastSeenDate = new Date(contact.lastSeen);
      const now = new Date();
      
      if (now.getTime() - lastSeenDate.getTime() < 24 * 60 * 60 * 1000) {
        return `Last seen today at ${format(lastSeenDate, 'HH:mm')}`;
      } else if (now.getTime() - lastSeenDate.getTime() < 48 * 60 * 60 * 1000) {
        return `Last seen yesterday at ${format(lastSeenDate, 'HH:mm')}`;
      } else {
        return `Last seen on ${format(lastSeenDate, 'dd MMM')}`;
      }
    }
    
    return null;
  };
  
  return (
    <div className="p-3 border-b bg-card flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={contact.avatar} />
          <AvatarFallback className="bg-muted">
            {contact.name.split(' ')
              .map(n => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium flex items-center gap-2">
            {contact.name}
            {contact.isOnline && (
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
            )}
            
            <Badge className={`${getContactTypeColor()} ml-1 text-xs`}>
              {contact.type === 'team' ? 'Team' : 
               contact.type === 'client' ? 'Client' : 'Lead'}
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {contact.role || getLastSeenText() || contact.phone}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {/* Call/Video buttons if not team member */}
        {contact.type !== 'team' && (
          <>
            <Button variant="ghost" size="icon" title="Voice call">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Video call">
              <Video className="h-4 w-4" />
            </Button>
          </>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onInfoClick}
          title="Contact info"
        >
          <User className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toggleContactStar(contact.id)}>
              <Star className="mr-2 h-4 w-4" />
              {contact.isStarred ? 'Remove from starred' : 'Add to starred'}
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => muteContact(contact.id, !contact.isMuted)}>
              {contact.isMuted ? (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Unmute notifications
                </>
              ) : (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  Mute notifications
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => archiveContact(contact.id)}>
              <Archive className="mr-2 h-4 w-4" />
              Archive conversation
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => clearChat(contact.id)}>
              <MessageSquareText className="mr-2 h-4 w-4" />
              Clear messages
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => blockContact(contact.id)}>
              <Ban className="mr-2 h-4 w-4" />
              Block {contact.name}
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => reportContact(contact.id, 'spam')}>
              <Flag className="mr-2 h-4 w-4" />
              Report {contact.name}
            </DropdownMenuItem>
            
            <DropdownMenuItem className="text-destructive" onClick={() => clearChat(contact.id)}>
              <Trash className="mr-2 h-4 w-4" />
              Delete conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ConversationHeader;
