
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, MoreVertical, Reply } from 'lucide-react';
import { Message } from '@/types/conversation';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MessageListProps {
  messages: Message[];
  contactName: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isTyping?: boolean;
  onReaction?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  contactName,
  messagesEndRef,
  isTyping = false,
  onReaction,
  onReply
}) => {
  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
  
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
            {message.content && <p className="text-xs text-gray-500">{message.content}</p>}
          </div>
        </div>
      );
    } else if (message.type === 'voice' && message.media) {
      return (
        <div className="mt-2 flex items-center p-2 bg-gray-100 rounded-md">
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs">{message.media.duration}s</span>
            <audio controls className="h-8 w-full">
              <source src={message.media.url} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      );
    } else {
      return <div className="text-sm">{message.content}</div>;
    }
  };

  // Render Message Reactions
  const renderReactions = (message: Message) => {
    if (!message.reactions || message.reactions.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {message.reactions.map((reaction, index) => (
          <div key={index} className="bg-gray-100 rounded-full px-1.5 py-0.5 flex items-center gap-1">
            <span>{reaction.emoji}</span>
            <span className="text-[10px] text-muted-foreground">{reaction.userName}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4">
      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isOutbound ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`group max-w-[70%] ${message.isOutbound ? 'bg-primary text-primary-foreground' : 'bg-white border'} rounded-lg p-3 shadow-sm`}>
              {!message.isOutbound && (
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={message.media?.url} />
                    <AvatarFallback className="text-[10px]">
                      {contactName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{contactName}</span>
                </div>
              )}
              {message.isOutbound && message.sender && (
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                      {message.sender.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{message.sender}</span>
                </div>
              )}
              
              {message.replyTo && (
                <div className="mb-2 p-1.5 bg-gray-100 rounded border-l-2 border-gray-300 text-gray-600">
                  <p className="text-xs font-medium">
                    {message.replyTo.isOutbound ? "You" : contactName}
                  </p>
                  <p className="text-xs truncate">{message.replyTo.content}</p>
                </div>
              )}
              
              {renderMessageContent(message)}
              
              <div className="text-[10px] mt-1 flex justify-end items-center gap-1 opacity-80">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {message.isOutbound && message.status === 'read' && (
                  <CheckCircle className="h-3 w-3" />
                )}
              </div>
              
              {renderReactions(message)}
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-1 top-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-full hover:bg-black/10">
                      <MoreVertical className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onReply && (
                      <DropdownMenuItem onClick={() => onReply(message)}>
                        <Reply className="mr-2 h-4 w-4" />
                        Reply
                      </DropdownMenuItem>
                    )}
                    {onReaction && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Add reaction
                          </DropdownMenuItem>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-1" align="end">
                          <div className="flex gap-1">
                            {reactionEmojis.map((emoji) => (
                              <button
                                key={emoji}
                                className="p-1 hover:bg-gray-100 rounded"
                                onClick={() => onReaction(message.id, emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                    <DropdownMenuItem>Copy text</DropdownMenuItem>
                    <DropdownMenuItem>Forward</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[70%] bg-white border rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">
                    {contactName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{contactName}</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
