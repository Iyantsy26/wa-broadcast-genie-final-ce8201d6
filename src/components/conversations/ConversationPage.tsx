import React from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import ConversationList from './ConversationList';
import NoConversation from './NoConversation';
import ContactInfoSidebar from './ContactInfoSidebar';
import DeviceSelector from './DeviceSelector';
import AIAssistantPanel from './AIAssistantPanel';
import CannedResponseSelector from './CannedResponseSelector';
import AddContactButton from './AddContactButton';
import { Button } from "@/components/ui/button";
import { ChatType, Contact } from '@/types/conversation';
import MessageList from '../chat/MessageList';
import MessageInput from '../chat/MessageInput';
import ChatHeader from '../chat/ChatHeader';

const ConversationPage = () => {
  const {
    filteredConversations,
    groupedConversations,
    activeConversation,
    messages,
    isSidebarOpen,
    isTyping,
    isReplying,
    replyTo,
    cannedReplies,
    selectedDevice,
    aiAssistantActive,
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
    addContact
  } = useConversation();

  // Create a wrapper function for handleAddContact that adapts to expected interface
  const handleAddContact = (name: string, phone: string, type: ChatType) => {
    const newContact: Contact = {
      id: `new-${Date.now()}`,
      name,
      phone,
      type,
      tags: [],
      isOnline: false
    };
    addContact(newContact);
  };

  // Define dummy pinConversation function to satisfy the interface
  const pinConversation = (conversationId: string) => {
    console.log('Pin conversation not implemented:', conversationId);
  };

  // Extract the messages array for the active conversation
  const activeMessages = activeConversation ? 
    (messages[activeConversation.id] || []) : [];

  // Create a wrapper function for AI assistance to return a Promise
  const handleRequestAIAssistancePromise = async (prompt: string): Promise<string> => {
    if (handleRequestAIAssistance) {
      handleRequestAIAssistance(); // This function doesn't take parameters now
    }
    return `Response to: ${prompt}`;
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
          <AddContactButton onAddContact={handleAddContact} />
          <Button 
            variant="outline" 
            onClick={() => setAiAssistantActive(!aiAssistantActive)}
          >
            {aiAssistantActive ? 'Hide AI Assistant' : 'Show AI Assistant'}
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
          conversations={filteredConversations || []}
          groupedConversations={groupedConversations || {}}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          chatTypeFilter={chatTypeFilter || 'all'}
          setChatTypeFilter={setChatTypeFilter}
          searchTerm={searchTerm || ''}
          setSearchTerm={setSearchTerm}
          dateRange={dateRange}
          setDateRange={setDateRange}
          assigneeFilter={assigneeFilter || ''}
          setAssigneeFilter={setAssigneeFilter}
          tagFilter={tagFilter || ''}
          setTagFilter={setTagFilter}
          resetAllFilters={resetAllFilters}
          pinConversation={pinConversation}
          archiveConversation={handleArchiveConversation}
        />
        
        <div className="flex-1 flex flex-col border rounded-lg bg-white shadow-sm overflow-hidden">
          {activeConversation ? (
            <>
              <ChatHeader 
                conversation={activeConversation}
                onOpenContactInfo={() => setIsSidebarOpen(true)}
              />
              <MessageList 
                messages={activeMessages} 
                contactName={activeConversation.contact.name}
                messagesEndRef={messagesEndRef}
                isTyping={isTyping}
                onReaction={handleAddReaction}
                onReply={handleReplyToMessage}
              />
              <div className="flex-shrink-0">
                {isReplying && replyTo && (
                  <div className="p-2 bg-gray-100 border-t flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-xs font-medium">Replying to:</span>
                      <p className="text-sm truncate">{replyTo.content}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleCancelReply}>
                      Cancel
                    </Button>
                  </div>
                )}
                <CannedResponseSelector 
                  cannedReplies={cannedReplies || []}
                  onSelectReply={handleUseCannedReply || (() => {})}
                />
                <MessageInput 
                  onSendMessage={handleSendMessage}
                  onVoiceMessageSent={handleVoiceMessageSent}
                  replyTo={replyTo}
                  onCancelReply={handleCancelReply || (() => {})}
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
        
        {aiAssistantActive && (
          <AIAssistantPanel 
            onRequestAIAssistance={handleRequestAIAssistancePromise}
            onClose={() => setAiAssistantActive(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ConversationPage;
