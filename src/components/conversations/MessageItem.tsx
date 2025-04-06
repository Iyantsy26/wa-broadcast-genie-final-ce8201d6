
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Message, Contact } from '@/types/conversation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MoreVertical, 
  Reply, 
  Trash, 
  Smile,
  CheckCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConversation } from '@/contexts/ConversationContext';

interface MessageItemProps {
  message: Message;
  contact: Contact;
  isSequential?: boolean;
  isLast?: boolean;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  contact,
  isSequential = false,
  isLast = false,
  onReaction,
  onReply
}) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const { handleAddReaction, deleteMessage } = useConversation();
  
  const commonEmojis = ['👍', '❤️', '😂', '🙏', '😮', '😢', '👏'];
  
  const renderContent = () => {
    if (message.type === 'image' && message.media) {
      return (
        <div>
          <img 
            src={message.media.url} 
            alt="Image"
            className="max-h-60 rounded-md object-cover"
          />
          {message.content && (
            <p className="mt-1 text-sm">{message.content}</p>
          )}
        </div>
      );
    }
    
    if (message.type === 'video' && message.media) {
      return (
        <div>
          <video 
            src={message.media.url} 
            controls
            className="max-h-60 w-full rounded-md"
          />
          {message.content && (
            <p className="mt-1 text-sm">{message.content}</p>
          )}
        </div>
      );
    }
    
    if (message.replyTo) {
      return (
        <div>
          <div className="bg-muted/30 p-2 rounded border-l-2 border-primary mb-2 text-sm">
            <p className="text-xs font-medium">{message.replyTo.sender || (message.replyTo.isOutbound ? 'You' : contact.name)}</p>
            <p className="text-muted-foreground truncate">{message.replyTo.content}</p>
          </div>
          <p>{message.content}</p>
        </div>
      );
    }
    
    return <p>{message.content}</p>;
  };
  
  const getMessageStatus = () => {
    if (!message.isOutbound) return null;
    
    switch (message.status) {
      case 'sending':
        return <span className="text-muted-foreground">Sending...</span>;
      case 'sent':
        return <CheckCircle className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <div className="flex text-muted-foreground"><CheckCircle className="h-3 w-3" /><CheckCircle className="h-3 w-3 -ml-1" /></div>;
      case 'read':
        return <div className="flex text-primary"><CheckCircle className="h-3 w-3" /><CheckCircle className="h-3 w-3 -ml-1" /></div>;
      case 'error':
        return <span className="text-destructive text-xs">Failed</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className={`flex ${message.isOutbound ? 'justify-end' : 'justify-start'} relative group mb-1`}>
      {!message.isOutbound && !isSequential && (
        <Avatar className="h-6 w-6 mr-2 mt-1">
          <AvatarImage src={contact.avatar} />
          <AvatarFallback className="text-[10px]">
            {contact.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={`
          relative
          max-w-[75%]
          ${message.isOutbound 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-white border'
          }
          ${isSequential
            ? (message.isOutbound 
                ? 'rounded-tl-xl rounded-bl-xl rounded-tr-sm' 
                : 'rounded-tr-xl rounded-br-xl rounded-tl-sm')
            : (message.isOutbound 
                ? 'rounded-tl-xl rounded-tr-xl rounded-bl-xl' 
                : 'rounded-tr-xl rounded-tl-xl rounded-br-xl')
          }
          p-3 shadow-sm
        `}
      >
        {!isSequential && !message.isOutbound && (
          <p className="text-xs font-medium mb-1">{contact.name}</p>
        )}
        
        {renderContent()}
        
        <div className="flex justify-end items-center gap-1 mt-1 text-xs opacity-70">
          <span>{format(new Date(message.timestamp), 'h:mm a')}</span>
          {getMessageStatus()}
        </div>
        
        {/* Message reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`absolute ${message.isOutbound ? 'left-0' : 'right-0'} -bottom-2 flex`}>
            {message.reactions.map((reaction, i) => (
              <div 
                key={`${reaction.userId}-${i}`}
                className="bg-white rounded-full h-5 w-5 flex items-center justify-center text-xs shadow border -ml-1 first:ml-0"
                title={`${reaction.userName} reacted with ${reaction.emoji}`}
              >
                {reaction.emoji}
              </div>
            ))}
          </div>
        )}
        
        {/* Message actions (visible on hover) */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            className="p-1 hover:bg-gray-200 rounded-full"
            onClick={() => setShowEmojis(!showEmojis)}
          >
            <Smile className="h-3 w-3" />
          </button>
          
          <button
            className="p-1 hover:bg-gray-200 rounded-full"
            onClick={() => onReply(message)}
          >
            <Reply className="h-3 w-3" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-gray-200 rounded-full">
                <MoreVertical className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onReply(message)}>
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </DropdownMenuItem>
              {message.isOutbound && (
                <DropdownMenuItem onClick={() => deleteMessage(message.id)} className="text-destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Emoji picker */}
        {showEmojis && (
          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-2 flex gap-1">
            {commonEmojis.map(emoji => (
              <button 
                key={emoji}
                className="hover:bg-gray-100 p-1 rounded"
                onClick={() => {
                  onReaction(message.id, emoji);
                  setShowEmojis(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
