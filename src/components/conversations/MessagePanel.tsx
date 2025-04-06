
import React from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import { Contact } from '@/types/conversation';
import ConversationHeader from './ConversationHeader';
import MessageList from './MessageList';
import MessageInputBar from './MessageInputBar';

interface MessagePanelProps {
  contact: Contact;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ contact }) => {
  const {
    messages,
    isTyping,
    replyTo,
    wallpaper,
    messagesEndRef,
    setIsSidebarOpen,
    handleSendMessage,
    handleVoiceMessageSent,
    setReplyTo,
  } = useConversation();
  
  // Set background style if wallpaper is set
  const backgroundStyle = wallpaper
    ? { backgroundImage: `url(${wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};
  
  // Implement missing toggleSidebar as a function that calls setIsSidebarOpen
  const toggleSidebar = () => {
    setIsSidebarOpen(true);
  };

  // Aliases for compatibility
  const sendMessage = handleSendMessage;
  const sendVoiceMessage = handleVoiceMessageSent;
  
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Conversation header */}
      <ConversationHeader 
        contact={contact} 
        onInfoClick={toggleSidebar}
      />
      
      {/* Message list */}
      <div 
        className="flex-1 overflow-y-auto bg-slate-50" 
        style={backgroundStyle}
      >
        <MessageList 
          messages={messages || []}
          contact={contact}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
        />
      </div>
      
      {/* Message input */}
      <MessageInputBar
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSendMessage={sendMessage}
        onSendVoiceMessage={sendVoiceMessage}
      />
    </div>
  );
};

export default MessagePanel;
