
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

  // Create a function that returns a Promise<string> as required by the AIAssistantPanel
  const handleRequestAIAssistance = async (prompt: string): Promise<string> => {
    console.log('AI assistance requested with prompt:', prompt);
    // This would typically call an API or service
    // to generate AI-powered responses
    
    // For now, just return a mock response
    return Promise.resolve(`AI response to: ${prompt}`);
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
          onRequestAIAssistance={handleRequestAIAssistance}
          onClose={() => toggleAssistant()}
        />
      )}
    </div>
  );
};

export default ConversationLayout;
