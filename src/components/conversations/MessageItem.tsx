
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Message, Contact } from '@/types/conversation';
import { Check, CheckCheck, Clock, X, MoreHorizontal, Reply, Trash2, Copy } from 'lucide-react';
import { useConversation } from '@/contexts/ConversationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmojiPicker } from '../ui/emoji-picker';

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
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const { 
    addReaction, 
    deleteMessage, 
    handleReplyToMessage 
  } = useConversation();
  
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3" />;
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };
  
  const handleReactionSelect = (emoji: string) => {
    addReaction(message.id, emoji);
    setShowReactionPicker(false);
  };

  const handleDeleteClick = () => {
    deleteMessage(message.id);
  };
  
  const handleReplyClick = () => {
    handleReplyToMessage(message);
  };
  
  const handleCopyClick = () => {
    navigator.clipboard.writeText(message.content);
  };
  
  const formattedTime = format(new Date(message.timestamp), 'h:mm a');
  
  // Determine message container styles
  const containerStyles = message.isOutbound
    ? 'flex justify-end mb-2'
    : 'flex mb-2';
    
  // Determine message bubble styles
  const bubbleStyles = message.isOutbound
    ? 'bg-blue-500 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg max-w-[70%]'
    : 'bg-white border rounded-tl-lg rounded-tr-lg rounded-br-lg max-w-[70%]';
    
  return (
    <div className={containerStyles}>
      {/* Reply preview */}
      {message.replyTo && (
        <div className="flex flex-col">
          <div className="text-xs text-gray-500">
            Replying to {message.replyTo.isOutbound ? 'yourself' : contact.name}
          </div>
          <div className="text-sm bg-gray-100 p-1 rounded">
            {message.replyTo.content}
          </div>
        </div>
      )}
      
      {/* Message content */}
      <div className={`p-3 ${bubbleStyles}`}>
        {/* Message type specific content */}
        {message.type === 'text' && <p>{message.content}</p>}
        {message.type === 'image' && message.media && (
          <div className="mb-2">
            <img 
              src={message.media.url} 
              alt="Attachment" 
              className="rounded-md max-w-full"
            />
            <p>{message.content}</p>
          </div>
        )}
        {message.type === 'voice' && message.media && (
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <div>
              <div>Voice message</div>
              <div className="text-xs text-gray-500">{message.media.duration}s</div>
            </div>
          </div>
        )}
        
        {/* Message footer with time and status */}
        <div className="flex justify-end items-center gap-1 mt-1">
          <span className="text-xs opacity-70">{formattedTime}</span>
          {message.isOutbound && getStatusIcon()}
        </div>
      </div>
      
      {/* Message actions */}
      <div className="relative self-center ml-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-full hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleReplyClick}>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowReactionPicker(true)}>
              <span className="mr-2">😀</span>
              Add reaction
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyClick}>
              <Copy className="h-4 w-4 mr-2" />
              Copy text
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Reaction picker dropdown */}
        {showReactionPicker && (
          <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-2 z-10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">Add reaction</span>
              <button 
                onClick={() => setShowReactionPicker(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="flex gap-1">
              {['👍', '❤️', '😂', '😮', '😢', '👏'].map((emoji) => (
                <button
                  key={emoji}
                  className="p-1 hover:bg-gray-100 rounded"
                  onClick={() => handleReactionSelect(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
