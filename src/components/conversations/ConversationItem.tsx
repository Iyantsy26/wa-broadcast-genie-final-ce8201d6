
import React from 'react';
import { format } from 'date-fns';
import { Conversation, LastMessage } from '@/types/conversation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PinIcon } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, isActive, onClick }) => {
  const { lastMessage } = conversation;
  
  const formattedTimestamp = lastMessage.timestamp 
    ? format(new Date(lastMessage.timestamp), 'h:mm a') 
    : '';
  
  return (
    <div 
      className={`p-3 ${isActive ? 'bg-muted' : 'hover:bg-muted/50'} cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={conversation.contact.avatar} />
          <AvatarFallback>
            {conversation.contact.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <div className="font-medium truncate flex items-center gap-1">
              {conversation.contact.name}
              {conversation.isPinned && <PinIcon className="h-3 w-3 text-amber-500 -rotate-45" />}
            </div>
            <div className="text-xs text-muted-foreground">{formattedTimestamp}</div>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <div className="text-sm text-muted-foreground truncate">
              {lastMessage.isOutbound && 'You: '}
              {lastMessage.content}
            </div>
            
            {conversation.unreadCount ? (
              <Badge variant="default" className="ml-2 h-5 min-w-[20px] px-1">
                {conversation.unreadCount}
              </Badge>
            ) : (
              lastMessage.isOutbound && (
                <span className="text-xs text-muted-foreground">
                  {lastMessage.isRead ? '✓✓' : '✓'}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
