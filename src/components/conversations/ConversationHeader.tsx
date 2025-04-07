
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Info, Phone, Video, MoreVertical } from 'lucide-react';
import { Contact } from '@/types/conversation';

interface ConversationHeaderProps {
  contact: Contact;
  onInfoClick: () => void;
  deviceId: string;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  contact,
  onInfoClick,
  deviceId
}) => {
  return (
    <div className="p-3 border-b flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={contact.avatar} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {contact.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <div className="font-medium flex items-center">
            {contact.name}
            {contact.isOnline && (
              <span className="h-2 w-2 bg-green-500 rounded-full ml-2"></span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {contact.isOnline ? 'Online' : 'Last seen recently'} • Device #{deviceId}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onInfoClick}>
          <Info className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ConversationHeader;
