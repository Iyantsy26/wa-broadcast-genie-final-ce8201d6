
import React from 'react';
import { format } from 'date-fns';
import { Message, Contact } from '@/types/conversation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Play, Reply, SmilePlus, MoreVertical, Globe } from 'lucide-react';
import { useConversation } from '@/contexts/ConversationContext';

interface MessageItemProps {
  message: Message;
  contact: Contact;
  isSequential: boolean;
  isLast: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, contact, isSequential, isLast }) => {
  const { addReaction, deleteMessage, handleReplyToMessage } = useConversation();

  const renderContent = () => {
    if (message.type === 'image' && message.media) {
      return (
        <div className="mt-2">
          <img 
            src={message.media.url} 
            alt="Image attachment" 
            className="rounded-md max-h-60 object-cover"
          />
          {message.content && <p className="mt-1 text-sm">{message.content}</p>}
        </div>
      );
    } else if (message.type === 'video' && message.media) {
      return (
        <div className="mt-2">
          <video 
            src={message.media.url} 
            className="rounded-md max-h-60 w-full" 
            controls
          />
          {message.content && <p className="mt-1 text-sm">{message.content}</p>}
        </div>
      );
    } else if (message.type === 'document' && message.media) {
      return (
        <div className="mt-2 flex items-center p-2 bg-gray-100 rounded-md">
          <div>
            <p className="text-sm font-medium">{message.media.filename || "Document"}</p>
            {message.media.size && (
              <p className="text-xs text-gray-500">
                {(message.media.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
            {message.content && <p className="text-xs text-gray-500">{message.content}</p>}
          </div>
        </div>
      );
    } else if (message.type === 'voice' && message.media) {
      return (
        <div className="mt-2 flex items-center p-2 bg-gray-100 rounded-md">
          <div className="flex items-center space-x-2 w-full">
            <button className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
              <Play className="h-4 w-4" />
            </button>
            <div className="flex-1">
              <div className="h-1 w-full bg-gray-300 rounded-full">
                <div className="h-1 w-1/3 bg-primary rounded-full"></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>0:00</span>
                <span>{message.media.duration}s</span>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (message.replyTo) {
      return (
        <div>
          <div className="bg-muted/50 p-2 rounded-md mb-1 border-l-2 border-primary text-sm">
            <div className="font-medium text-xs">{message.replyTo.sender}</div>
            <div className="text-muted-foreground truncate">{message.replyTo.content}</div>
          </div>
          <div className="text-sm">{message.content}</div>
        </div>
      );
    } else {
      return <div className="text-sm whitespace-pre-wrap">{message.content}</div>;
    }
  };
  
  const getMessageStatus = () => {
    if (!message.isOutbound) return null;
    
    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case 'sent':
        return <CheckCircle className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <div className="flex"><CheckCircle className="h-3 w-3 text-muted-foreground" /><CheckCircle className="h-3 w-3 text-muted-foreground -ml-1" /></div>;
      case 'read':
        return <div className="flex"><CheckCircle className="h-3 w-3 text-primary" /><CheckCircle className="h-3 w-3 text-primary -ml-1" /></div>;
      default:
        return null;
    }
  };
  
  const showAvatar = !isSequential || !message.isOutbound;
  
  return (
    <div className={`flex items-end gap-2 ${message.isOutbound ? 'justify-end' : 'justify-start'} ${!isSequential ? 'mt-3' : 'mt-1'}`}>
      {!message.isOutbound && showAvatar && (
        <Avatar className="h-6 w-6">
          <AvatarImage src={contact.avatar} />
          <AvatarFallback className="text-[10px]">
            {contact.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      )}
      
      {!message.isOutbound && !showAvatar && <div className="w-6" />}
      
      <div className={`
        group relative max-w-[75%] 
        ${message.isOutbound 
          ? 'bg-primary text-primary-foreground rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
          : 'bg-white border rounded-tl-lg rounded-tr-lg rounded-br-lg'
        } 
        p-3 shadow-sm
      `}>
        {/* Message sender if needed */}
        {!isSequential && message.sender && !message.isOutbound && (
          <div className="text-xs font-medium mb-1">
            {message.sender}
          </div>
        )}
        
        {/* Message content */}
        {renderContent()}
        
        {/* Message metadata */}
        <div className="text-[10px] mt-1 flex justify-end items-center gap-1.5 opacity-80">
          {format(new Date(message.timestamp), 'h:mm a')}
          {getMessageStatus()}
        </div>
        
        {/* Message actions on hover */}
        <div className={`
          absolute ${message.isOutbound ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'}
          top-1/2 -translate-y-1/2
          opacity-0 group-hover:opacity-100 transition-opacity
          flex flex-col items-center gap-1 p-1
        `}>
          <button 
            className="h-7 w-7 bg-white border rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
            onClick={() => handleReplyToMessage && handleReplyToMessage(message)}
          >
            <Reply className="h-3 w-3" />
          </button>
          <button 
            className="h-7 w-7 bg-white border rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
            onClick={() => {}}
          >
            <SmilePlus className="h-3 w-3" />
          </button>
          <button 
            className="h-7 w-7 bg-white border rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
            onClick={() => {}}
          >
            <MoreVertical className="h-3 w-3" />
          </button>
        </div>
        
        {/* WhatsApp indicator */}
        {message.viaWhatsApp && (
          <Badge variant="outline" className="absolute -top-2 right-2 text-[9px] h-4 px-1 bg-whatsapp/10 text-whatsapp border-whatsapp/20">
            <Globe className="h-2 w-2 mr-0.5" />
            WhatsApp
          </Badge>
        )}
      </div>
      
      {message.isOutbound && showAvatar && (
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
            {message.sender?.split(' ').map(n => n[0]).join('') || 'You'}
          </AvatarFallback>
        </Avatar>
      )}
      
      {message.isOutbound && !showAvatar && <div className="w-6" />}
    </div>
  );
};

export default MessageItem;
