
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Message } from '@/types/conversation';
import MessageItem from './MessageItem';
import { Contact } from '@/types/conversation';

interface MessageListProps {
  messages: Message[];
  contact: Contact;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  contact,
  isTyping,
  messagesEndRef,
  onReaction,
  onReply
}) => {
  // Group messages by date
  const messagesByDate = useMemo(() => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = format(new Date(message.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  }, [messages]);
  
  // Sort dates
  const sortedDates = useMemo(() => {
    return Object.keys(messagesByDate).sort();
  }, [messagesByDate]);
  
  // Format the date for display
  const formatDate = (dateKey: string) => {
    const date = new Date(dateKey);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday';
    } else {
      return format(date, 'EEEE, MMMM d, yyyy');
    }
  };
  
  return (
    <div className="p-4 space-y-6">
      {sortedDates.map(dateKey => (
        <div key={dateKey} className="space-y-3">
          {/* Date separator */}
          <div className="flex justify-center">
            <div className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
              {formatDate(dateKey)}
            </div>
          </div>
          
          {/* Messages for this date */}
          {messagesByDate[dateKey].map((message, index) => {
            const prevMessage = index > 0 ? messagesByDate[dateKey][index - 1] : null;
            const nextMessage = index < messagesByDate[dateKey].length - 1 
              ? messagesByDate[dateKey][index + 1] 
              : null;
              
            // Check if this is part of a sequence of messages from the same sender
            const isSequential = prevMessage && 
              prevMessage.isOutbound === message.isOutbound && 
              prevMessage.sender === message.sender &&
              (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() < 60000); // 1 minute
              
            return (
              <MessageItem 
                key={message.id}
                message={message}
                contact={contact}
                isSequential={isSequential}
                isLast={!nextMessage || nextMessage.isOutbound !== message.isOutbound}
                onReaction={onReaction}
                onReply={onReply}
              />
            );
          })}
        </div>
      ))}
      
      {/* Typing indicator */}
      {isTyping && (
        <div className="flex mb-3">
          <div className="flex items-center bg-white p-3 text-sm rounded-tl-2xl rounded-tr-2xl rounded-br-2xl shadow-sm">
            <div className="flex space-x-1 px-2">
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Anchor element for scrolling to bottom */}
      <div ref={messagesEndRef} />
      
      {/* When no messages */}
      {messages.length === 0 && (
        <div className="text-center text-muted-foreground p-6">
          <p className="mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation with {contact.name}</p>
        </div>
      )}
    </div>
  );
};

export default MessageList;
