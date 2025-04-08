
import React, { useRef, useEffect } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import { Contact, Message } from '@/types/conversation';
import ConversationHeader from './ConversationHeader';
import MessageList from './MessageList';
import MessageInputBar from './MessageInputBar';

interface MessagePanelProps {
  contact: Contact;
  deviceId: string;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ contact, deviceId }) => {
  const {
    messages,
    isTyping,
    replyTo,
    wallpaper,
    messagesEndRef,
    toggleSidebar,
    sendMessage,
    sendVoiceMessage,
    setReplyTo,
    addReaction
  } = useConversation();
  
  const contactMessages = messages[contact.id] || [];
  
  // Set background style if wallpaper is set
  const backgroundStyle = wallpaper
    ? { backgroundImage: `url(${wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};
  
  const handleSendMessage = (message: string) => {
    sendMessage(contact.id, message, deviceId);
  };

  const handleSendVoiceMessage = (durationInSeconds: number) => {
    sendVoiceMessage(contact.id, durationInSeconds, deviceId);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Conversation header */}
      <ConversationHeader 
        contact={contact} 
        onInfoClick={toggleSidebar}
        deviceId={deviceId}
      />
      
      {/* Message list */}
      <div 
        className="flex-1 overflow-y-auto bg-slate-50" 
        style={backgroundStyle}
      >
        <MessageList 
          messages={contactMessages}
          contact={contact}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
          onReaction={handleReaction}
          onReply={handleReply}
        />
      </div>
      
      {/* Message input */}
      <MessageInputBar
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSendMessage={handleSendMessage}
        onSendVoiceMessage={handleSendVoiceMessage}
        deviceId={deviceId}
      />
    </div>
  );
};

export default MessagePanel;
