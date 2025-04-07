
import React, { useRef, useEffect } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import { Contact, Message, Conversation } from '@/types/conversation';
import ConversationHeader from './ConversationHeader';
import MessageList from './MessageList';
import MessageInputBar from './MessageInputBar';

interface MessagePanelProps {
  contact?: Contact;
  conversation?: Conversation;
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onOpenContactInfo: () => void;
  onSendMessage: (content: string, file: File | null) => void;
  onVoiceMessageSent: (durationInSeconds: number) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
  onCancelReply: () => void; // Added this prop
  onLocationShare?: () => void;
  deviceId: string;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ 
  contact, 
  conversation,
  messages, 
  isTyping, 
  messagesEndRef,
  onOpenContactInfo,
  onSendMessage,
  onVoiceMessageSent,
  onReaction,
  onReply,
  onCancelReply, // Added this parameter
  onLocationShare,
  deviceId
}) => {
  // If conversation is provided, use its contact data
  const displayContact = contact || (conversation ? conversation.contact : null);
  
  if (!displayContact) {
    console.error('MessagePanel: No contact provided');
    return <div>Missing contact information</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Conversation header */}
      <ConversationHeader 
        contact={displayContact} 
        onInfoClick={onOpenContactInfo}
        deviceId={deviceId}
      />
      
      {/* Message list */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <MessageList 
          messages={messages}
          contact={displayContact}
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
        onCancelReply={onCancelReply}
        onLocationShare={onLocationShare}
        deviceId={deviceId}
      />
    </div>
  );
};

export default MessagePanel;
