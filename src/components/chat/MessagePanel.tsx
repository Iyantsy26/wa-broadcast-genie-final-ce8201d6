
import React, { useState } from 'react';
import { Contact, Message, Conversation } from '@/types/conversation';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface MessagePanelProps {
  contact: Contact;
  conversation?: Conversation;
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onOpenContactInfo: () => void;
  onSendMessage: (content: string, file: File | null, replyToMessageId?: string) => void;
  onVoiceMessageSent: (durationInSeconds: number) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  onCancelReply: () => void; // Added this prop
  onLocationShare?: () => void;
  deviceId?: string;
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
  deviceId
}) => {
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  
  const handleSendMessage = (content: string, file: File | null) => {
    onSendMessage(content, file);
    setReplyTo(null);
  };
  
  // Create a dummy conversation object for ChatHeader if one wasn't provided
  const headerConversation = conversation || {
    id: contact.id,
    contact: contact,
    lastMessage: {
      content: '',
      timestamp: new Date().toISOString(),
      isOutbound: false,
      isRead: true
    },
    chatType: contact.type
  };
  
  const handleReply = (message: Message) => {
    setReplyTo(message);
    if (onReply) onReply(message);
  };
  
  const handleCancelReply = () => {
    setReplyTo(null);
    onCancelReply();
  };

  // Create an AI assistance function for the message input
  const handleRequestAIAssistance = async (prompt: string): Promise<string> => {
    // In a real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses = [
      `I suggest responding to "${prompt.substring(0, 20)}..." with a clear and professional message addressing their needs.`,
      `Based on "${prompt.substring(0, 20)}...", you might want to acknowledge their request and provide a timeline for follow-up.`,
      `For "${prompt.substring(0, 20)}...", consider asking clarifying questions before committing to anything specific.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden">
      <ChatHeader 
        conversation={headerConversation}
        onOpenContactInfo={onOpenContactInfo}
      />
      
      <MessageList 
        messages={messages}
        contactName={contact.name}
        isTyping={isTyping}
        onReaction={onReaction}
        onReply={handleReply}
        messagesEndRef={messagesEndRef}
      />
      
      <MessageInput 
        onSendMessage={handleSendMessage}
        onVoiceMessageSent={onVoiceMessageSent}
        isEncrypted={false}
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
        onRequestAIAssistance={handleRequestAIAssistance}
      />
    </div>
  );
};

export default MessagePanel;
