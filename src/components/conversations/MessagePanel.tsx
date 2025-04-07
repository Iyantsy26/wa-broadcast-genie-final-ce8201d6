
import React, { useRef, useEffect } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import { Contact, Message } from '@/types/conversation';
import ConversationHeader from './ConversationHeader';
import MessageList from './MessageList';
import MessageInputBar from './MessageInputBar';

interface MessagePanelProps {
  contact: Contact;
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onOpenContactInfo: () => void;
  onSendMessage: (content: string, file: File | null) => void;
  onVoiceMessageSent: (durationInSeconds: number) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
  onLocationShare?: () => void;
  deviceId: string;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ 
  contact, 
  messages, 
  isTyping, 
  messagesEndRef,
  onOpenContactInfo,
  onSendMessage,
  onVoiceMessageSent,
  onReaction,
  onReply,
  onLocationShare,
  deviceId
}) => {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Conversation header */}
      <ConversationHeader 
        contact={contact} 
        onInfoClick={onOpenContactInfo}
        deviceId={deviceId}
      />
      
      {/* Message list */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <MessageList 
          messages={messages}
          contact={contact}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
        />
      </div>
      
      {/* Message input */}
      <MessageInputBar
        onSendMessage={onSendMessage}
        onSendVoiceMessage={onVoiceMessageSent}
        onReaction={onReaction}
        onReply={onReply}
        onLocationShare={onLocationShare}
        deviceId={deviceId}
      />
    </div>
  );
};

export default MessagePanel;
