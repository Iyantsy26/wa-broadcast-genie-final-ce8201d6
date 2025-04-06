
import React from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import ConversationList from '@/components/chat/ConversationList';
import MessagePanel from '@/components/chat/MessagePanel';
import ContactInfoSidebar from '@/components/chat/ContactInfoSidebar';

const ChatPage = () => {
  const {
    filteredConversations,
    groupedConversations,
    activeConversation,
    messages,
    isSidebarOpen,
    chatTypeFilter,
    searchTerm,
    dateRange,
    assigneeFilter,
    tagFilter,
    selectedContactId,
    setActiveConversation,
    setIsSidebarOpen,
    setChatTypeFilter,
    setSearchTerm,
    setDateRange,
    setAssigneeFilter,
    setTagFilter,
    resetAllFilters,
    handleSendMessage,
    handleVoiceMessageSent,
    handleDeleteConversation,
    handleArchiveConversation,
    handleAddTag,
    handleAssignConversation,
    messagesEndRef
  } = useConversation();

  // Get messages for active conversation
  const activeMessages = selectedContactId && messages[selectedContactId] ? messages[selectedContactId] : [];

  return (
    <div className="space-y-4 h-full flex flex-col animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
          <p className="text-muted-foreground">
            Manage your team and client conversations
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-4 h-[calc(100vh-13rem)] overflow-hidden">
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
          pinConversation={() => {}}
          archiveConversation={handleArchiveConversation}
        />
        
        {activeConversation ? (
          <MessagePanel 
            conversation={activeConversation}
            messages={activeMessages}
            onOpenContactInfo={() => setIsSidebarOpen(true)}
            onSendMessage={handleSendMessage}
            onVoiceMessageSent={handleVoiceMessageSent}
            messagesEndRef={messagesEndRef}
            isTyping={false}
            onReaction={() => {}}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white rounded-lg border shadow-sm">
            <div className="text-center p-8">
              <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
              <p className="text-muted-foreground">
                Select a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
        
        {activeConversation && (
          <ContactInfoSidebar 
            conversation={activeConversation}
            isOpen={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
