
import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Smartphone } from 'lucide-react';
import { Conversation } from '@/types/conversation';
import { useConversation } from '@/contexts/ConversationContext';
import HeaderActions from './HeaderActions';

interface ConversationHeaderProps {
  conversation: Conversation;
  onOpenContactInfo: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onOpenContactInfo
}) => {
  const { 
    handleDeleteConversation, 
    handleArchiveConversation, 
    handleAddTag, 
    handleAssignConversation 
  } = useConversation();

  return (
    <div className="p-3 border-b flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Avatar className="h-9 w-9">
          <AvatarImage src={conversation.contact.avatar} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {conversation.contact.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium flex items-center gap-1.5">
            {conversation.contact.name}
            {conversation.contact.isOnline && (
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Smartphone className="h-3 w-3" />
            {conversation.contact.phone}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onOpenContactInfo}>
          <User className="h-4 w-4" />
        </Button>
        <HeaderActions 
          conversation={conversation}
          onDeleteConversation={handleDeleteConversation}
          onArchiveConversation={handleArchiveConversation}
          onAddTag={handleAddTag}
          onAssignConversation={handleAssignConversation}
        />
      </div>
    </div>
  );
};

export default ConversationHeader;
