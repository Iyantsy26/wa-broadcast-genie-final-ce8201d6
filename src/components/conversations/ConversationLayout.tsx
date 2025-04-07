
import React from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import ContactSidebar from './ContactSidebar';
import MessagePanel from './MessagePanel';
import ContactInfoPanel from './ContactInfoPanel';
import AIAssistantPanel from './AIAssistantPanel';
import EmptyConversation from './EmptyConversation';

interface ConversationLayoutProps {
  currentDeviceId: string;
}

const ConversationLayout: React.FC<ConversationLayoutProps> = ({ currentDeviceId }) => {
  const {
    selectedContactId,
    contacts,
    messages,
    isSidebarOpen,
    isAssistantActive,
    isTyping,
    messagesEndRef,
    toggleSidebar,
    toggleAssistant,
    sendMessage,
    sendVoiceMessage,
    sendAttachment,
    sendLocation,
    addReaction,
    setReplyTo,
    replyTo,
    requestAIAssistance
  } = useConversation();
  
  const selectedContact = selectedContactId 
    ? contacts.find(c => c.id === selectedContactId) 
    : null;
    
  // Get messages for the selected contact
  const selectedContactMessages = selectedContactId 
    ? (messages[selectedContactId] || [])
    : [];

  // Create wrapper functions for handleSendMessage and handleVoiceMessage
  const handleSendMessage = (content: string, file: File | null) => {
    if (!selectedContactId) return;
    
    if (file) {
      const fileType = file.type.split('/')[0]; 
      let mediaType: 'image' | 'video' | 'document';
      
      if (fileType === 'image') mediaType = 'image';
      else if (fileType === 'video') mediaType = 'video';
      else mediaType = 'document';
      
      sendAttachment(selectedContactId, file, mediaType, currentDeviceId);
    } else if (content.trim()) {
      sendMessage(selectedContactId, content, currentDeviceId);
    }
  };
  
  const handleVoiceMessage = (durationInSeconds: number) => {
    if (!selectedContactId) return;
    sendVoiceMessage(selectedContactId, durationInSeconds, currentDeviceId);
  };
  
  const handleLocationShare = () => {
    if (!selectedContactId) return;
    // For demo, use fixed coordinates
    sendLocation(selectedContactId, 37.7749, -122.4194, currentDeviceId);
  };
  
  const handleReaction = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
  };

  // Add the cancel reply handler
  const handleCancelReply = () => {
    setReplyTo(null);
  };

  return (
    <div className="flex gap-3 overflow-hidden h-full">
      {/* Contact sidebar */}
      <ContactSidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex rounded-lg overflow-hidden bg-card shadow-sm">
        {selectedContact ? (
          <MessagePanel 
            contact={selectedContact} 
            messages={selectedContactMessages}
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
            onOpenContactInfo={toggleSidebar}
            onSendMessage={handleSendMessage}
            onVoiceMessageSent={handleVoiceMessage}
            onReaction={handleReaction}
            onReply={setReplyTo}
            onCancelReply={handleCancelReply}
            onLocationShare={handleLocationShare}
            deviceId={currentDeviceId}
          />
        ) : (
          <EmptyConversation />
        )}
      </div>
      
      {/* Contact info panel (when open) */}
      {isSidebarOpen && selectedContact && (
        <ContactInfoPanel contact={selectedContact} />
      )}
      
      {/* AI Assistant panel (when active) */}
      {isAssistantActive && (
        <AIAssistantPanel 
          onRequestAIAssistance={async (prompt: string) => {
            return await requestAIAssistance(prompt);
          }}
          onClose={toggleAssistant}
        />
      )}
    </div>
  );
};

export default ConversationLayout;
