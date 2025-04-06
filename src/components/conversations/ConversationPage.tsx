
import React from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import ConversationList from './ConversationList';
// import ConversationHeader from './ConversationHeader'; // Removed due to prop mismatch
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import NoConversation from './NoConversation';
import ContactInfoSidebar from './ContactInfoSidebar';
import DeviceSelector from './DeviceSelector';
import AIAssistantPanel from './AIAssistantPanel';
import CannedResponseSelector from './CannedResponseSelector';
import AddContactButton from './AddContactButton';
import { Button } from "@/components/ui/button";

// Create a simple Header component that matches the expected props
const ConversationHeader: React.FC<{
  contact: any;
  onInfoClick: () => void;
}> = ({ contact, onInfoClick }) => {
  return (
    <div className="p-3 border-b bg-card flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          {contact.name.charAt(0)}
        </div>
        <div>
          <div className="font-medium">{contact.name}</div>
          <div className="text-xs text-muted-foreground">
            {contact.isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onInfoClick}>
        Info
      </Button>
    </div>
  );
};

const ConversationPage = () => {
  const {
    filteredConversations,
    groupedConversations,
    activeConversation,
    messages,
    isSidebarOpen,
    isTyping,
    isReplying,
    replyToMessage,
    cannedReplies,
    selectedDevice,
    isAssistantActive,
    chatTypeFilter,
    searchTerm,
    dateRange,
    assigneeFilter,
    tagFilter,
    messagesEndRef,
    setActiveConversation,
    setIsSidebarOpen,
    setSelectedDevice,
    setAiAssistantActive,
    setChatTypeFilter,
    setSearchTerm,
    setDateRange,
    setAssigneeFilter,
    setTagFilter,
    resetAllFilters,
    handleSendMessage,
    handleVoiceMessageSent,
    handleArchiveConversation,
    handleDeleteConversation,
    handleAddReaction,
    handleReplyToMessage,
    handleCancelReply,
    handleUseCannedReply,
    handleRequestAIAssistance,
    handleAddContact
  } = useConversation();

  // Adapter function to bridge the interface between what MessageInput expects
  // and what our ConversationContext provides
  const sendMessageAdapter = (content: string, file: File | null) => {
    if (handleSendMessage) {
      // If file is provided, determine message type
      if (file) {
        const fileType = file.type.split('/')[0];
        const mediaType = fileType === 'image' ? 'image' : 
                          fileType === 'video' ? 'video' : 'document';
        
        // For files, we need to convert them to URLs or handle upload
        const mediaUrl = URL.createObjectURL(file);
        
        return handleSendMessage(content, mediaType, mediaUrl);
      }
      
      // For text messages
      return handleSendMessage(content);
    }
    return Promise.resolve();
  };

  // Define dummy pinConversation function to satisfy the interface
  const pinConversation = (conversationId: string) => {
    console.log('Pin conversation not implemented:', conversationId);
  };

  // Adapter function for AddContactButton
  const addContactAdapter = (name: string, phone: string, type: 'team' | 'client' | 'lead') => {
    if (handleAddContact) {
      return handleAddContact({
        name,
        phone,
        type,
        tags: []
      });
    }
  };

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="flex-none flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
          <p className="text-muted-foreground">
            Chat with clients, leads and team through WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddContactButton onAddContact={addContactAdapter} />
          <Button 
            variant="outline" 
            onClick={() => setAiAssistantActive(!isAssistantActive)}
          >
            {isAssistantActive ? 'Hide AI Assistant' : 'Show AI Assistant'}
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <DeviceSelector 
          selectedDevice={selectedDevice} 
          onSelectDevice={setSelectedDevice} 
        />
      </div>
      
      <div className="flex-1 flex space-x-4 overflow-hidden bg-gray-50 rounded-lg p-2">
        <ConversationList 
          conversations={filteredConversations}
          groupedConversations={groupedConversations}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          chatTypeFilter={chatTypeFilter}
          setChatTypeFilter={setChatTypeFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateRange={dateRange}
          setDateRange={setDateRange}
          assigneeFilter={assigneeFilter}
          setAssigneeFilter={setAssigneeFilter}
          tagFilter={tagFilter}
          setTagFilter={setTagFilter}
          resetAllFilters={resetAllFilters}
          pinConversation={pinConversation}
          archiveConversation={handleArchiveConversation}
        />
        
        <div className="flex-1 flex flex-col border rounded-lg bg-white shadow-sm overflow-hidden">
          {activeConversation ? (
            <>
              <ConversationHeader 
                contact={activeConversation.contact}
                onInfoClick={() => setIsSidebarOpen(true)}
              />
              <MessageList 
                messages={messages || []} 
                contact={activeConversation.contact}
                messagesEndRef={messagesEndRef}
                isTyping={isTyping}
              />
              <div className="flex-shrink-0">
                {isReplying && replyToMessage && (
                  <div className="p-2 bg-gray-100 border-t flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-xs font-medium">Replying to:</span>
                      <p className="text-sm truncate">{replyToMessage.content}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleCancelReply}>
                      Cancel
                    </Button>
                  </div>
                )}
                <CannedResponseSelector 
                  cannedReplies={[
                    { id: "1", title: "Greeting", content: "Hello there!" },
                    { id: "2", title: "Thank you", content: "Thank you for your message." },
                    { id: "3", title: "Follow up", content: "I'll get back to you shortly." }
                  ]}
                  onSelectReply={handleUseCannedReply}
                />
                <MessageInput 
                  onSendMessage={sendMessageAdapter}
                  onVoiceMessageSent={handleVoiceMessageSent}
                  replyTo={replyToMessage}
                  onCancelReply={handleCancelReply}
                />
              </div>
            </>
          ) : (
            <NoConversation />
          )}
        </div>
        
        {activeConversation && isSidebarOpen && (
          <ContactInfoSidebar 
            conversation={activeConversation}
            isOpen={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
        
        {isAssistantActive && (
          <AIAssistantPanel />
        )}
      </div>
    </div>
  );
};

export default ConversationPage;
