
import React from 'react';
import { Message, Contact } from '@/types/conversation';
import { useConversation } from '@/contexts/ConversationContext';

interface MessageItemProps {
  message: Message;
  contact: Contact;
  isSequential?: boolean;
  isLast?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  contact,
  isSequential = false,
  isLast = false
}) => {
  // Use context to access helper functions
  const { addReaction, deleteMessage } = useConversation();

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get message status icon/text
  const getStatusIndicator = () => {
    if (!message.isOutbound) return null;
    
    switch (message.status) {
      case 'sent':
        return <span className="text-xs">Sent</span>;
      case 'delivered':
        return <span className="text-xs">Delivered</span>;
      case 'read':
        return <span className="text-xs text-green-500">Read</span>;
      case 'error':
        return <span className="text-xs text-red-500">Failed</span>;
      default:
        return <span className="text-xs">Sending...</span>;
    }
  };

  // Render media based on type
  const renderMedia = () => {
    if (!message.media) return null;
    
    switch (message.media.type) {
      case 'image':
        return (
          <img 
            src={message.media.url} 
            alt="Image" 
            className="max-h-60 rounded object-contain"
          />
        );
      case 'video':
        return (
          <video 
            src={message.media.url}
            controls
            className="max-h-60 rounded"
          />
        );
      case 'voice':
        return (
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
            <button className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
            <div className="flex-1">
              <div className="h-1 bg-gray-300 rounded-full">
                <div className="h-1 w-1/3 bg-indigo-500 rounded-full"></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>0:00</span>
                <span>{message.media.duration || 0}s</span>
              </div>
            </div>
          </div>
        );
      case 'document':
        return (
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <div>
              <p className="text-sm font-medium">{message.media.filename || "Document"}</p>
              <p className="text-xs text-gray-500">
                {message.media.size 
                  ? `${Math.round(message.media.size / 1024)} KB` 
                  : "Download"}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Determine message container class
  const messageContainerClass = message.isOutbound
    ? "flex justify-end mb-2"
    : "flex justify-start mb-2";

  // Determine message bubble class
  const messageBubbleClass = message.isOutbound
    ? "bg-indigo-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl p-3 max-w-[80%]"
    : "bg-white border rounded-tl-2xl rounded-tr-2xl rounded-br-2xl p-3 max-w-[80%]";

  return (
    <div className={messageContainerClass}>
      <div className={messageBubbleClass}>
        {!isSequential && !message.isOutbound && (
          <div className="font-medium text-sm mb-1">{contact.name}</div>
        )}
        
        {message.replyTo && (
          <div className="rounded bg-black/10 px-3 py-1 mb-2 text-sm">
            <div className="text-xs font-medium">
              {message.replyTo.isOutbound ? "You" : contact.name}
            </div>
            <div className="truncate">{message.replyTo.content}</div>
          </div>
        )}
        
        {renderMedia()}
        
        {message.content && (
          <div className={message.media ? "mt-2" : ""}>
            {message.content}
          </div>
        )}
        
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] opacity-70">
            {formatTime(message.timestamp)}
          </span>
          <span className="ml-1">{getStatusIndicator()}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
