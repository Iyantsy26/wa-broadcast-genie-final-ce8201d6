
import { useConversationState } from './conversations/useConversationState';
import { useConversationFilters } from './conversations/useConversationFilters';
import { useConversationMessages } from './conversations/useConversationMessages';
import { useConversationActions } from './conversations/useConversationActions';
import { useState } from 'react';
import { Conversation, ChatType } from '@/types/conversation';

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
    chatTypeFilter,
    searchTerm,
    dateRange,
    assigneeFilter,
    tagFilter,
    setChatTypeFilter,
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
    setConversations,
    filteredConversations,
    groupedConversations,
    activeConversation,
    messages,
    loading,
    isSidebarOpen,
    
    // Filters
    chatTypeFilter,
    searchTerm,
    dateRange,
    assigneeFilter,
    tagFilter,
    
    // Refs
    messagesEndRef,
    
    // State setters
    setActiveConversation,
    setIsSidebarOpen,
    setChatTypeFilter,
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
