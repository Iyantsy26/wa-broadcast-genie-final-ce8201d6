
import React from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import ConversationList from '@/components/conversations/ConversationList';
import MessageList from '@/components/conversations/MessageList';
import MessageInput from '@/components/conversations/MessageInput';
import ContactInfoSidebar from '@/components/conversations/ContactInfoSidebar';
import ConversationHeader from '@/components/conversations/ConversationHeader';
import NoConversation from '@/components/conversations/NoConversation';

const ConversationPage = () => {
  const {
    filteredConversations,
    activeConversation,
    messages,
    isSidebarOpen,
    statusFilter,
    searchTerm,
    dateRange,
    assigneeFilter,
    tagFilter,
    setActiveConversation,
    setIsSidebarOpen,
    setStatusFilter,
    setSearchTerm,
    setDateRange,
    setAssigneeFilter,
    setTagFilter,
    resetAllFilters,
    handleSendMessage,
    messagesEndRef
  } = useConversation();

  return (
    <div className="space-y-4 h-full flex flex-col animate-fade-in">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
        <p className="text-muted-foreground">
          Manage your WhatsApp conversations with customers
        </p>
      </div>

      <div className="flex flex-1 gap-4 h-[calc(100vh-13rem)] overflow-hidden">
        <ConversationList 
          conversations={filteredConversations}
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
        />
        
        {activeConversation ? (
          <div className="flex-1 flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden">
            <ConversationHeader 
              conversation={activeConversation}
              onOpenContactInfo={() => setIsSidebarOpen(true)}
            />
            
            <MessageList 
              messages={messages}
              contactName={activeConversation.contact.name}
              messagesEndRef={messagesEndRef}
            />
            
            <MessageInput onSendMessage={handleSendMessage} />
          </div>
        ) : (
          <NoConversation />
        )}
        
        {activeConversation && (
          <ContactInfoSidebar 
            conversation={activeConversation}
            isOpen={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
          />
        )}
      </div>
    </div>
  );
};

export default ConversationPage;
