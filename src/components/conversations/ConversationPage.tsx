
import React from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import ConversationList from './ConversationList';
import ConversationHeader from './ConversationHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import NoConversation from './NoConversation';
import ContactInfoSidebar from './ContactInfoSidebar';

const ConversationPage = () => {
  const {
    filteredConversations,
    groupedConversations,
    activeConversation,
    messages,
    isSidebarOpen,
    statusFilter,
    searchTerm,
    dateRange,
    assigneeFilter,
    tagFilter,
    messagesEndRef,
    setActiveConversation,
    setIsSidebarOpen,
    setStatusFilter,
    setSearchTerm,
    setDateRange,
    setAssigneeFilter,
    setTagFilter,
    resetAllFilters,
    handleSendMessage,
    handleVoiceMessageSent,
    handleArchiveConversation
  } = useConversation();

  // Define dummy pinConversation function to satisfy the interface
  const pinConversation = (conversationId: string, isPinned: boolean) => {
    console.log('Pin conversation not implemented:', conversationId, isPinned);
  };

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="flex-none">
        <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
        <p className="text-muted-foreground">
          View and respond to client and lead conversations
        </p>
      </div>
      
      <div className="flex-1 flex space-x-4 overflow-hidden">
        <ConversationList 
          conversations={filteredConversations}
          groupedConversations={groupedConversations}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
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
                conversation={activeConversation}
                onOpenContactInfo={() => setIsSidebarOpen(true)}
              />
              <MessageList 
                messages={messages} 
                contactName={activeConversation.contact.name}
                messagesEndRef={messagesEndRef}
              />
              <MessageInput 
                onSendMessage={handleSendMessage}
                onVoiceMessageSent={handleVoiceMessageSent}
              />
            </>
          ) : (
            <NoConversation />
          )}
        </div>
        
        {activeConversation && isSidebarOpen && (
          <ContactInfoSidebar 
            conversation={activeConversation}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ConversationPage;
