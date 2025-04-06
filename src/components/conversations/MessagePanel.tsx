
import React, { useState } from 'react';
import { Message, MessageType, Conversation } from '@/types/conversation';
import ConversationHeader from './ConversationHeader';
import MessageList from './MessageList';
import MessageInputBar from './MessageInputBar';

interface MessagePanelProps {
  messages: Message[];
  contactName: string;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (content: string, file: File | null, replyToMessageId?: string) => Promise<void>;
  onVoiceMessageSent: (durationSeconds: number) => Promise<void>;
  onReaction?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  onOpenContactInfo: () => void;
  conversation: Conversation;
}

const MessagePanel: React.FC<MessagePanelProps> = ({
  messages,
  contactName,
  isTyping,
  messagesEndRef,
  onSendMessage,
  onVoiceMessageSent,
  onReaction,
  onReply,
  onOpenContactInfo,
  conversation
}) => {
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  
  const handleSendMessage = async (content: string, type?: MessageType, mediaUrl?: string): Promise<void> => {
    // In a real app, we would handle type and mediaUrl correctly
    // For now, we'll just pass the content along
    await onSendMessage(content, null);
  };
  
  const handleVoiceMessage = async (durationSeconds: number): Promise<void> => {
    await onVoiceMessageSent(durationSeconds);
  };
  
  const handleReply = (message: Message) => {
    setReplyTo(message);
    if (onReply) {
      onReply(message);
    }
  };
  
  const handleCancelReply = () => {
    setReplyTo(null);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with contact info */}
      <ConversationHeader 
        conversation={conversation} 
        onOpenContactInfo={onOpenContactInfo} 
      />
      
      {/* Message list area */}
      <MessageList 
        messages={messages}
        contact={conversation.contact}
        messagesEndRef={messagesEndRef}
        isTyping={isTyping}
        onReaction={onReaction}
        onReply={handleReply}
      />
      
      {/* Message input area */}
      <MessageInputBar 
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
        onSendMessage={handleSendMessage}
        onSendVoiceMessage={handleVoiceMessage}
      />
    </div>
  );
};

export default MessagePanel;
