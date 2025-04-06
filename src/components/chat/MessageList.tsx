
import React from 'react';
import { format } from 'date-fns';
import { Message } from '@/types/conversation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  Reply,
  Globe,
} from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  contactName: string;
  isTyping: boolean;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  contactName,
  isTyping,
  onReaction,
  onReply,
  messagesEndRef
}) => {
  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = {};
  
  messages.forEach(message => {
    const date = format(new Date(message.timestamp), 'yyyy-MM-dd');
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });
  
  const commonEmojis = ['👍', '❤️', '😂', '🙏', '😮', '😢', '👏'];
  
  const renderMessageContent = (message: Message) => {
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
              <play className="h-4 w-4" />
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
  
  const getMessageStatus = (message: Message) => {
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
  
  return (
    <ScrollArea className="flex-1 bg-gray-50">
      <div className="p-4 space-y-6">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-3">
            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="bg-white">
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </Badge>
            </div>
            
            {dateMessages.map((message, index) => {
              const isSameUser = index > 0 && 
                dateMessages[index-1].isOutbound === message.isOutbound &&
                dateMessages[index-1].sender === message.sender;
              
              const showSender = !isSameUser && (message.sender || !message.isOutbound);
              
              return (
                <div
                  key={message.id}
                  className={`group flex ${message.isOutbound ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    relative
                    max-w-[75%] 
                    ${message.isOutbound 
                      ? 'bg-primary text-primary-foreground rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                      : 'bg-white border rounded-tl-lg rounded-tr-lg rounded-br-lg'
                    } 
                    p-3 shadow-sm
                    ${(!isSameUser || showSender) ? 'mt-1' : '-mt-1'}
                  `}>
                    {/* Sender info */}
                    {showSender && (
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-5 w-5">
                          {message.isOutbound ? (
                            <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                              {message.sender?.split(' ').map(n => n[0]).join('') || 'You'}
                            </AvatarFallback>
                          ) : (
                            <>
                              <AvatarImage src={""} />
                              <AvatarFallback className="text-[10px]">
                                {contactName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        <span className="text-xs font-medium">
                          {message.isOutbound ? message.sender : contactName}
                        </span>
                        
                        {message.viaWhatsApp && (
                          <Badge variant="outline" className="text-[9px] h-4 px-1 bg-whatsapp/10 text-whatsapp border-whatsapp/20">
                            <Globe className="h-2 w-2 mr-0.5" />
                            WhatsApp
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Message content */}
                    {renderMessageContent(message)}
                    
                    {/* Message footer */}
                    <div className="text-[10px] mt-1 flex justify-end items-center gap-1.5 opacity-80">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      
                      {getMessageStatus(message)}
                    </div>
                    
                    {/* Message reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className={`absolute ${message.isOutbound ? 'left-0' : 'right-0'} -bottom-2.5 flex gap-0.5`}>
                        {message.reactions.map((reaction, i) => (
                          <span 
                            key={`${reaction.userId}-${i}`}
                            className="bg-white border rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm z-10"
                            title={`${reaction.userName} reacted with ${reaction.emoji}`}
                          >
                            {reaction.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Message actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-1 hover:bg-gray-200 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReply(message);
                        }}
                      >
                        <Reply className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex ml-12 mb-3">
            <div className="bg-white p-3 rounded-tr-2xl rounded-tl-2xl rounded-br-2xl shadow-sm animate-pulse">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
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
            <p className="text-sm">Start the conversation now</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default MessageList;
