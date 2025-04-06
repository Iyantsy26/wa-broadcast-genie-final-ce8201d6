
import React from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import ConversationList from './ConversationList';
import ConversationHeader from './ConversationHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import NoConversation from './NoConversation';
import ContactInfoSidebar from './ContactInfoSidebar';
import DeviceSelector from './DeviceSelector';
import AIAssistantPanel from './AIAssistantPanel';
import CannedResponseSelector from './CannedResponseSelector';
import AddContactButton from './AddContactButton';
import { Button } from "@/components/ui/button";
import { Contact, ChatType } from '@/types/conversation';

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
    aiAssistantActive,
    chatTypeFilter,
    searchTerm,
    dateRange,
    assigneeFilter,
    tagFilter,
    messagesEndRef,
    selectedContactId,
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
    handleAddContact,
    handleRequestAIAssistance
  } = useConversation();

  const activeMessages = selectedContactId && messages[selectedContactId] ? messages[selectedContactId] : [];

  const handleAddNewContact = (name: string, phone: string, type: ChatType) => {
    handleAddContact({
      name,
      phone,
      type
    });
  };
  
  // Simple function to handle pinning conversations
  const handlePinConversation = (conversationId: string) => {
    // This would be implemented in a real app
    console.log('Pinning conversation:', conversationId);
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
          <AddContactButton onAddContact={handleAddNewContact} />
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
          pinConversation={handlePinConversation}
          archiveConversation={handleArchiveConversation}
        />
        
        <div className="flex-1 flex flex-col border rounded-lg bg-white shadow-sm overflow-hidden">
          {activeConversation ? (
            <>
              <ConversationHeader 
                conversation={activeConversation}
                onOpenContactInfo={() => setIsSidebarOpen(true)}
              />
              <MessageList 
                messages={activeMessages}
                contact={activeConversation.contact}
                messagesEndRef={messagesEndRef}
                isTyping={isTyping}
                onReaction={handleAddReaction}
                onReply={handleReplyToMessage}
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
                  cannedReplies={cannedReplies}
                  onSelectReply={handleUseCannedReply}
                />
                <MessageInput 
                  onSendMessage={handleSendMessage}
                  onVoiceMessageSent={handleVoiceMessageSent}
                  replyTo={replyToMessage}
                  onCancelReply={handleCancelReply}
                  onRequestAIAssistance={handleRequestAIAssistance}
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
            onRequestAIAssistance={handleRequestAIAssistance}
            onClose={() => setAiAssistantActive(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ConversationPage;
