
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Contact, Message } from '@/types/conversation';
import { Star, CheckCheck, Check, Clock, AlertCircle } from 'lucide-react';

interface ContactItemProps {
  contact: Contact;
  messages: Message[];
  isActive: boolean;
  onClick: () => void;
}

const ContactItem: React.FC<ContactItemProps> = ({
  contact,
  messages,
  isActive,
  onClick,
}) => {
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  
  // Get unread messages count
  const unreadCount = messages.filter(m => !m.isOutbound && m.status !== 'read').length;
  
  // Format the timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return format(date, 'HH:mm');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (today.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return format(date, 'EEEE'); // Day name
    } else {
      return format(date, 'dd/MM/yyyy');
    }
  };
  
  // Get message status icon
  const getStatusIcon = (message: Message) => {
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
  
  // Format last message content
  const getLastMessageContent = (message: Message) => {
    if (message.type === 'text') {
      return message.content;
    } else if (message.type === 'image') {
      return '📷 Image';
    } else if (message.type === 'video') {
      return '🎥 Video';
    } else if (message.type === 'document') {
      return '📎 Document';
    } else if (message.type === 'voice') {
      return '🎤 Voice message';
    } else {
      return 'New message';
    }
  };
  
  // Get contact type color
  const getTypeColor = () => {
    switch (contact.type) {
      case 'team':
        return 'text-indigo-500';
      case 'client':
        return 'text-emerald-500';
      case 'lead':
        return 'text-amber-500';
      default:
        return 'text-gray-500';
    }
  };
  
  // Get initials for avatar fallback
  const getInitials = () => {
    if (!contact.name) return 'U'; // Fallback for undefined name
    
    return contact.name
      .split(' ')
      .map(n => n?.[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Check if avatar URL is valid
  const hasValidAvatar = () => {
    return contact.avatar && 
           typeof contact.avatar === 'string' && 
           contact.avatar.trim() !== '';
  };
  
  return (
    <div
      className={`px-3 py-3 flex items-start gap-3 cursor-pointer transition-colors border-l-2 hover:bg-muted/50 ${
        isActive 
          ? 'bg-muted border-l-primary' 
          : 'border-l-transparent'
      }`}
      onClick={onClick}
    >
      {/* Avatar with online indicator */}
      <div className="relative flex-shrink-0">
        <Avatar>
          {hasValidAvatar() ? (
            <AvatarImage 
              src={contact.avatar} 
              alt={contact.name}
              onError={(e) => {
                console.warn(`Avatar failed to load for ${contact.name}`);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          <AvatarFallback className={`bg-muted ${getTypeColor()}`}>
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        {contact.isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-background"></span>
        )}
      </div>
      
      {/* Contact info and last message */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <div className="font-medium truncate flex items-center gap-1">
            {contact.name}
            {contact.isStarred && (
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {lastMessage && formatTime(lastMessage.timestamp)}
          </div>
        </div>
        
        {/* Last message */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground truncate flex items-center gap-1">
            {lastMessage && (
              <>
                {lastMessage.isOutbound && (
                  <span className="text-xs font-medium text-primary mr-1">
                    You:
                  </span>
                )}
                {getLastMessageContent(lastMessage)}
              </>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {lastMessage && getStatusIcon(lastMessage)}
            
            {/* Unread badge */}
            {unreadCount > 0 && (
              <Badge 
                className="h-5 w-5 rounded-full p-0 flex items-center justify-center"
                variant="default"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Tags row */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {contact.tags.map((tag, idx) => (
              <Badge 
                key={idx}
                variant="outline" 
                className="text-[10px] py-0 px-1"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactItem;
