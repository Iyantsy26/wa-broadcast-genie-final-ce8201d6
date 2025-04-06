
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Conversation } from '@/types/conversation';
import { MessageSquare, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { getStatusColor, getStatusIcon } from './StatusUtils';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick
}) => {
  return (
    <div 
      className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
        isActive ? 'bg-gray-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.contact.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {conversation.contact.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {conversation.contact.isOnline && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white"></span>
            )}
          </div>
          <div>
            <div className="font-medium">{conversation.contact.name}</div>
            <div className="text-xs text-muted-foreground">{conversation.contact.phone}</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
      
      <div className="flex justify-between items-start">
        <div className="text-sm line-clamp-1 flex-1 mr-2">
          {conversation.lastMessage.isOutbound && <span className="text-primary font-medium mr-1">You:</span>}
          {conversation.lastMessage.content}
        </div>
        <div className="flex flex-col items-end gap-1">
          {!conversation.lastMessage.isOutbound && !conversation.lastMessage.isRead && (
            <div className="h-2 w-2 rounded-full bg-primary"></div>
          )}
          <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(conversation.status)}`}>
            {getStatusIcon(conversation.status)}
            <span className="ml-0.5 capitalize">{conversation.status}</span>
          </div>
        </div>
      </div>
      
      {conversation.tags && conversation.tags.length > 0 && (
        <div className="flex gap-1 mt-1.5">
          {conversation.tags.map((tag, index) => (
            <div 
              key={index}
              className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-full"
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationItem;
