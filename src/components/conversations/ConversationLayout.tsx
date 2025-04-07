
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
    isSidebarOpen,
    isAssistantActive,
    toggleAssistant
  } = useConversation();
  
  const selectedContact = selectedContactId 
    ? contacts.find(c => c.id === selectedContactId) 
    : null;

  return (
    <div className="flex gap-3 overflow-hidden h-full">
      {/* Contact sidebar */}
      <ContactSidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex rounded-lg overflow-hidden bg-card shadow-sm">
        {selectedContact ? (
          <MessagePanel 
            contact={selectedContact} 
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
            console.log('AI assistance requested with prompt:', prompt);
            // Return a promise with some mock data
            return Promise.resolve(`AI response to: ${prompt}`);
          }}
          onClose={() => toggleAssistant()}
        />
      )}
    </div>
  );
};

export default ConversationLayout;
