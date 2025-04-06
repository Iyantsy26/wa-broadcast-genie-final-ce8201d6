
import React from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import ContactSidebar from './ContactSidebar';
import MessagePanel from './MessagePanel';
import ContactInfoPanel from './ContactInfoPanel';
import AIAssistantPanel from './AIAssistantPanel';
import EmptyConversation from './EmptyConversation';

const ConversationLayout = () => {
  const {
    selectedContactId,
    contacts,
    messages,
    isSidebarOpen,
    isAssistantActive,
    handleRequestAIAssistance,
    handleSendMessage,
    handleVoiceMessageSent,
    handleAddReaction,
    isTyping,
    messagesEndRef,
    setIsSidebarOpen
  } = useConversation();
  
  const selectedContact = selectedContactId 
    ? contacts.find(c => c.id === selectedContactId) 
    : null;
  
  // Get messages for selected contact
  const selectedContactMessages = selectedContactId ? messages[selectedContactId] || [] : [];

  return (
    <div className="flex flex-col h-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
        <p className="text-muted-foreground">
          Manage all your conversations in one place
        </p>
      </div>
      
      <div className="flex-1 flex gap-3 overflow-hidden">
        {/* Contact sidebar */}
        <ContactSidebar />
        
        {/* Main content area */}
        <div className="flex-1 flex rounded-lg overflow-hidden bg-card shadow-sm">
          {selectedContact ? (
            <MessagePanel 
              messages={selectedContactMessages} 
              contactName={selectedContact.name}
              isTyping={isTyping}
              messagesEndRef={messagesEndRef}
              onSendMessage={handleSendMessage}
              onVoiceMessageSent={handleVoiceMessageSent}
              onReaction={handleAddReaction}
              onOpenContactInfo={() => setIsSidebarOpen(true)}
              conversation={{
                id: selectedContactId || '',
                contact: selectedContact,
                lastMessage: { content: '', timestamp: '', isOutbound: false, isRead: false },
                chatType: selectedContact.type
              }}
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
            onRequestAIAssistance={handleRequestAIAssistance} 
            onClose={() => {}} 
          />
        )}
      </div>
    </div>
  );
};

export default ConversationLayout;
