
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Message, Contact } from '@/types/conversation';
import { useConversation } from '@/contexts/ConversationContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Smile,
  Reply,
  MoreHorizontal,
  CheckCheck,
  Check,
  Clock,
  AlertCircle,
  Play,
  FileText,
  Image as ImageIcon,
  Film,
  Forward,
  Copy,
  Trash,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

interface MessageItemProps {
  message: Message;
  contact: Contact;
  isSequential: boolean;
  isLast: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  contact,
  isSequential,
  isLast
}) => {
  const { addReaction, deleteMessage, setReplyTo } = useConversation();
  const [showActions, setShowActions] = useState(false);
  
  const commonEmojis = ['👍', '❤️', '😊', '🙏', '👏', '🎉', '😂', '🔥'];
  
  // Get message status icon
  const getStatusIcon = () => {
    if (!message.isOutbound) return null;
    
    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      default:
        return null;
    }
  };
  
  // Format time
  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm');
  };
  
  // Format message content based on type
  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return <p className="whitespace-pre-wrap">{message.content}</p>;
      case 'image':
        return (
          <div>
            {message.media && (
              <div className="mt-1 mb-2">
                <img 
                  src={message.media.url} 
                  alt="Image attachment" 
                  className="rounded-md max-w-full max-h-60 object-cover"
                />
              </div>
            )}
            {message.content && <p>{message.content}</p>}
          </div>
        );
      case 'video':
        return (
          <div>
            {message.media && (
              <div className="mt-1 mb-2">
                <video 
                  src={message.media.url} 
                  controls
                  className="rounded-md max-w-full max-h-60"
                />
              </div>
            )}
            {message.content && <p>{message.content}</p>}
          </div>
        );
      case 'document':
        return (
          <div className="flex items-center p-2 bg-muted/50 rounded-md">
            <div className="mr-3 p-2 bg-muted rounded">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {message.media?.filename || "Document"}
              </p>
              {message.media?.size && (
                <p className="text-xs text-muted-foreground">
                  {(message.media.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
        );
      case 'voice':
        return (
          <div className="flex items-center p-3 bg-muted/50 rounded-md">
            <button className="h-8 w-8 mr-3 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <Play className="h-4 w-4" />
            </button>
            <div className="flex-1">
              <div className="h-1 w-full bg-muted rounded-full">
                <div className="h-1 w-1/3 bg-primary rounded-full"></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>0:00</span>
                <span>{message.media?.duration || 0}s</span>
              </div>
            </div>
          </div>
        );
      default:
        return <p>{message.content}</p>;
    }
  };
  
  // Render reply to content if present
  const renderReplyTo = () => {
    if (!message.replyTo) return null;
    
    let replyContent = message.replyTo.content;
    const replyType = message.replyTo.type;
    
    if (replyType === 'image') {
      replyContent = '📷 Image';
    } else if (replyType === 'video') {
      replyContent = '🎥 Video';
    } else if (replyType === 'document') {
      replyContent = '📎 Document';
    } else if (replyType === 'voice') {
      replyContent = '🎤 Voice message';
    }
    
    return (
      <div className={`mb-1 p-2 rounded-md ${message.isOutbound ? 'bg-primary/20' : 'bg-muted'}`}>
        <div className="text-xs font-semibold">
          {message.replyTo.isOutbound ? 'You' : message.replyTo.sender}
        </div>
        <div className="text-xs truncate">
          {replyContent}
        </div>
      </div>
    );
  };
  
  // Get borderRadius based on message sequence
  const getBorderRadius = () => {
    if (message.isOutbound) {
      return isSequential
        ? 'rounded-tr-md rounded-tl-2xl rounded-bl-2xl'
        : 'rounded-2xl rounded-br-md';
    } else {
      return isSequential
        ? 'rounded-tl-md rounded-tr-2xl rounded-br-2xl'
        : 'rounded-2xl rounded-bl-md';
    }
  };
  
  return (
    <div 
      className={`group flex ${message.isOutbound ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar for received messages */}
      {!message.isOutbound && !isSequential && (
        <Avatar className="h-8 w-8 mr-2 mt-1">
          <AvatarImage src={contact.avatar} />
          <AvatarFallback className="text-xs">
            {contact.name.split(' ')
              .map(n => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      )}
      
      {/* Message spacer for sequential messages */}
      {!message.isOutbound && isSequential && <div className="w-8 mr-2" />}
      
      {/* Message actions that appear on hover */}
      {showActions && (
        <div className={`flex items-center self-end mb-2 ${message.isOutbound ? 'mr-2' : 'ml-2 order-1'}`}>
          <div className="flex bg-background border rounded-full shadow-sm">
            {/* Reply button */}
            <button 
              className="h-6 w-6 flex items-center justify-center hover:bg-muted rounded-full"
              onClick={() => setReplyTo(message)}
              title="Reply"
            >
              <Reply className="h-3 w-3" />
            </button>
            
            {/* Emoji reaction */}
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className="h-6 w-6 flex items-center justify-center hover:bg-muted rounded-full"
                  title="Add reaction"
                >
                  <Smile className="h-3 w-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1" side={message.isOutbound ? 'top' : 'top'}>
                <div className="flex gap-1">
                  {commonEmojis.map(emoji => (
                    <button
                      key={emoji}
                      className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded"
                      onClick={() => addReaction(message.id, emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="h-6 w-6 flex items-center justify-center hover:bg-muted rounded-full"
                  title="More actions"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" side="top">
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReplyTo(message)}>
                  <Reply className="mr-2 h-4 w-4" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward className="mr-2 h-4 w-4" />
                  Forward
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="mr-2 h-4 w-4" />
                  Star
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive" 
                  onClick={() => deleteMessage(message.id)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      
      {/* Message bubble */}
      <div className="max-w-[75%]">
        {/* Reply preview if this message is replying to another one */}
        {renderReplyTo()}
        
        {/* Message bubble */}
        <div
          className={`relative px-4 py-2 text-sm ${getBorderRadius()} ${
            message.isOutbound 
              ? 'bg-primary text-primary-foreground ml-2' 
              : 'bg-background border mr-2'
          }`}
        >
          {/* Sender name for received messages */}
          {!message.isOutbound && !isSequential && (
            <div className="font-medium text-xs mb-1 text-primary">
              {message.sender}
            </div>
          )}
          
          {/* Message content */}
          {renderMessageContent()}
          
          {/* Timestamp and status */}
          <div className="text-[10px] mt-1 flex items-center justify-end gap-1 opacity-70">
            {formatTime(message.timestamp)}
            {getStatusIcon()}
          </div>
        </div>
        
        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`flex mt-1 ${message.isOutbound ? 'justify-end' : 'justify-start'}`}>
            <div className="flex -space-x-1 bg-background border rounded-full shadow-sm px-1 py-0.5">
              {message.reactions.map((reaction, index) => (
                <div 
                  key={index}
                  className="text-xs w-5 h-5 flex items-center justify-center" 
                  title={`${reaction.userName} reacted with ${reaction.emoji}`}
                >
                  {reaction.emoji}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
