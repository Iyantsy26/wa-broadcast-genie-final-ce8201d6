
import React from 'react';
import { Message, Contact } from '@/types/conversation';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageListProps {
  messages: Message[];
  contact: Contact;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isTyping: boolean;
  onReaction?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  contact, 
  messagesEndRef,
  isTyping,
  onReaction,
  onReply
}) => {
  const getMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`flex ${message.isOutbound ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[70%] rounded-lg px-4 py-2 ${
              message.isOutbound 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}
          >
            {!message.isOutbound && (
              <div className="flex items-center mb-1">
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback className="text-xs">
                    {contact.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{message.sender || contact.name}</span>
              </div>
            )}
            
            {message.replyTo && (
              <div className={`text-xs p-1 mb-1 rounded ${
                message.isOutbound 
                  ? 'bg-primary-foreground/20 text-primary-foreground/80' 
                  : 'bg-background text-muted-foreground'
              }`}>
                <div className="font-medium">
                  {message.replyTo.isOutbound ? "You" : message.replyTo.sender}
                </div>
                <div className="truncate">{message.replyTo.content}</div>
              </div>
            )}
            
            <div className="break-words">{message.content}</div>
            
            <div 
              className={`text-xs mt-1 ${
                message.isOutbound 
                  ? 'text-primary-foreground/70' 
                  : 'text-muted-foreground'
              } flex items-center justify-end`}
            >
              <span>{getMessageTime(message.timestamp)}</span>
              {message.isOutbound && (
                <span className="ml-1">
                  {message.status === 'read' ? '✓✓' : '✓'}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {isTyping && (
        <div className="flex">
          <div className="max-w-[70%] rounded-lg px-4 py-2 bg-muted">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
