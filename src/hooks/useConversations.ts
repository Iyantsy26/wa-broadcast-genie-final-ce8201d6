
import { useConversationState } from './conversations/useConversationState';
import { useConversationFilters } from './conversations/useConversationFilters';
import { useConversationMessages } from './conversations/useConversationMessages';
import { useConversationActions } from './conversations/useConversationActions';

export const useConversations = () => {
  const {
    conversations,
    setConversations,
    loading,
    activeConversation,
    setActiveConversation,
    isSidebarOpen,
    setIsSidebarOpen,
    refreshConversations
  } = useConversationState();

  const {
    filteredConversations,
    groupedConversations,
    statusFilter,
    searchTerm,
    dateRange,
    assigneeFilter,
    tagFilter,
    setStatusFilter,
    setSearchTerm,
    setDateRange,
    setAssigneeFilter,
    setTagFilter,
    resetAllFilters
  } = useConversationFilters(conversations);

  const {
    messages,
    messagesEndRef,
    handleSendMessage,
    handleVoiceMessageSent
  } = useConversationMessages(activeConversation, setConversations, setActiveConversation);

  const {
    handleDeleteConversation,
    handleArchiveConversation,
    handleAddTag,
    handleAssignConversation
  } = useConversationActions(
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    setIsSidebarOpen
  );

  return {
    // State
    conversations,
    filteredConversations,
    groupedConversations,
    activeConversation,
    messages,
    loading,
    isSidebarOpen,
    
    // Filters
    statusFilter,
    searchTerm,
    dateRange,
    assigneeFilter,
    tagFilter,
    
    // Refs
    messagesEndRef,
    
    // State setters
    setActiveConversation,
    setIsSidebarOpen,
    setStatusFilter,
    setSearchTerm,
    setDateRange,
    setAssigneeFilter,
    setTagFilter,
    resetAllFilters,
    
    // Message actions
    handleSendMessage,
    handleVoiceMessageSent,
    
    // Conversation actions
    refreshConversations,
    handleDeleteConversation,
    handleArchiveConversation,
    handleAddTag,
    handleAssignConversation
  };
};
