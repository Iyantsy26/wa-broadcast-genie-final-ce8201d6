
import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Phone, 
  Video, 
  Search, 
  MoreVertical, 
  ChevronLeft
} from 'lucide-react';
import { Conversation } from '@/types/conversation';

interface ChatHeaderProps {
  conversation: Conversation;
  onOpenContactInfo: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation, onOpenContactInfo }) => {
  const { contact } = conversation;
  
  return (
    <div className="p-3 border-b flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="md:hidden" size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <button 
          className="flex items-center gap-3"
          onClick={onOpenContactInfo}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={contact.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {contact.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-left">
            <div className="font-medium">{contact.name}</div>
            <div className="text-xs text-muted-foreground">
              {contact.isOnline ? (
                <span className="flex items-center">
                  <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1"></span>
                  Online
                </span>
              ) : (
                'Offline'
              )}
            </div>
          </div>
        </button>
      </div>
      
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex">
          <Phone className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex">
          <Video className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Search className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
