
import React from 'react';
import { Message, Contact } from '@/types/conversation';
import { format } from 'date-fns';
import { CheckCircle, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConversation } from '@/contexts/ConversationContext';
import { EmojiPicker } from '@/components/ui/emoji-picker';

interface MessageItemProps {
  message: Message;
  contact: Contact;
  isSequential: boolean;
  isLast: boolean;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  contact,
  isSequential,
  isLast,
  onReaction,
  onReply
}) => {
  const { addReaction, deleteMessage } = useConversation();
  
  const handleReaction = (emoji: string) => {
    onReaction(message.id, emoji);
  };
  
  const getMessageStatus = () => {
    if (!message.isOutbound) return null;
    
    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case 'sent':
        return <CheckCircle className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return (
          <div className="flex">
            <CheckCircle className="h-3 w-3 text-muted-foreground" />
            <CheckCircle className="h-3 w-3 text-muted-foreground -ml-1" />
          </div>
        );
      case 'read':
        return (
          <div className="flex">
            <CheckCircle className="h-3 w-3 text-primary" />
            <CheckCircle className="h-3 w-3 text-primary -ml-1" />
          </div>
        );
      default:
        return null;
    }
  };
  
  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="mt-1">
            {message.media && (
              <img 
                src={message.media.url} 
                alt="Image attachment"
                className="rounded-md max-h-60 object-cover"
              />
            )}
            {message.content && <p className="mt-1 text-sm">{message.content}</p>}
          </div>
        );
      case 'voice':
        return (
          <div className="mt-1 flex items-center p-2 bg-gray-100 rounded-md">
            <button className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
            <div className="flex-1">
              <div className="h-1 w-full bg-gray-300 rounded-full">
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
        return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
    }
  };
  
  return (
    <div className={`flex ${message.isOutbound ? 'justify-end' : 'justify-start'} group`}>
      <div 
        className={`
          relative
          ${message.isOutbound 
            ? 'bg-primary text-primary-foreground rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
            : 'bg-white border rounded-tl-lg rounded-tr-lg rounded-br-lg'
          }
          p-3 shadow-sm
          max-w-[75%]
          ${!isSequential ? 'mt-2' : 'mt-1'}
        `}
      >
        {/* Sender info (only show for first message in a sequence) */}
        {!isSequential && (
          <div className="flex items-center gap-1 mb-1">
            {!message.isOutbound && (
              <Avatar className="h-4 w-4">
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback className="text-[8px]">
                  {contact.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="text-xs font-medium">
              {message.isOutbound ? 'You' : contact.name}
            </span>
          </div>
        )}
        
        {/* Message content */}
        {renderContent()}
        
        {/* Message footer */}
        <div className="text-[10px] mt-1 flex justify-end items-center gap-1">
          <span>
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>
          {getMessageStatus()}
        </div>
        
        {/* Message reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="absolute bottom-0 translate-y-1/2 flex">
            {message.reactions.map((reaction, index) => (
              <div 
                key={index}
                className="bg-white shadow-sm rounded-full w-4 h-4 flex items-center justify-center text-[10px] -ml-1 first:ml-0"
              >
                {reaction.emoji}
              </div>
            ))}
          </div>
        )}
        
        {/* Message actions (on hover) */}
        <div 
          className={`
            absolute top-0 ${message.isOutbound ? 'left-0' : 'right-0'}
            ${message.isOutbound ? '-translate-x-full' : 'translate-x-full'}
            px-1 py-2
            opacity-0 group-hover:opacity-100 transition-opacity
            flex flex-col gap-1
          `}
        >
          <button 
            onClick={() => onReply(message)}
            className="w-6 h-6 bg-white rounded-full shadow flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 17 4 12 9 7"></polyline>
              <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
            </svg>
          </button>
          
          <EmojiPicker onEmojiSelect={(emoji) => handleReaction(emoji)} />
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
