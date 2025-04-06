
import React from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import { Message, Contact } from '@/types/conversation';

interface MessageItemProps {
  message: Message;
  contact: Contact;
  isSequential?: boolean;
  isLast?: boolean;
  onReply?: (message: Message) => void;
}

const MessageItem = ({ message, contact, isSequential = false, isLast = false, onReply }: MessageItemProps) => {
  const { handleReplyToMessage } = useConversation();

  // Pass the reply to the parent component which will handle it
  const handleReply = () => {
    if (onReply) {
      onReply(message);
    } else {
      handleReplyToMessage(message);
    }
  };

  // Format message timestamp to just show the time
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Determine message container classes based on message direction
  const containerClasses = `
    ${message.isOutbound ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto bg-muted'}
    ${isSequential ? 'mt-1' : 'mt-3'} 
    rounded-lg p-3 max-w-[75%] relative
  `;

  // Render appropriate message content based on type
  const renderContent = () => {
    switch(message.type) {
      case 'image':
        return message.media ? (
          <div className="mb-1">
            <img 
              src={message.media.url} 
              alt="Image" 
              className="rounded-md max-w-full max-h-60 object-cover"
            />
            {message.content && <p className="mt-1 text-sm">{message.content}</p>}
          </div>
        ) : <p>{message.content}</p>;
      
      case 'video':
        return message.media ? (
          <div className="mb-1">
            <video 
              src={message.media.url}
              controls
              className="rounded-md max-w-full max-h-60"
            />
            {message.content && <p className="mt-1 text-sm">{message.content}</p>}
          </div>
        ) : <p>{message.content}</p>;
        
      case 'document':
        return message.media ? (
          <div className="flex items-center mb-1">
            <div className="bg-secondary/30 px-3 py-2 rounded-md">
              <p className="font-medium text-sm">{message.media.filename || 'Document'}</p>
              <p className="text-xs opacity-70">{message.content}</p>
            </div>
          </div>
        ) : <p>{message.content}</p>;
        
      default:
        return <p className="whitespace-pre-wrap">{message.content}</p>;
    }
  };

  return (
    <div className={containerClasses}>
      {renderContent()}
      
      <div className="flex items-center justify-end gap-1 mt-1 text-xs opacity-70">
        <span>{formatTime(message.timestamp)}</span>
        {message.isOutbound && (
          <span className="text-xs">
            {message.status === 'read' ? '✓✓' : 
             message.status === 'delivered' ? '✓✓' : 
             message.status === 'sent' ? '✓' : '🕒'}
          </span>
        )}
      </div>
      
      <button 
        className="absolute top-2 right-2 opacity-0 hover:opacity-100 bg-background/80 rounded-full p-1 text-xs"
        onClick={handleReply}
      >
        Reply
      </button>
    </div>
  );
};

export default MessageItem;
