
import { useConversationState } from './conversations/useConversationState';
import { useConversationFilters } from './conversations/useConversationFilters';
import { useConversationMessages } from './conversations/useConversationMessages';
import { useConversationActions } from './conversations/useConversationActions';
import { useState } from 'react';
import { Conversation, ChatType, Contact } from '@/types/conversation';
import { importContactsFromTeam } from '@/services/contactService';
import { toast } from 'sonner';

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

  // Add function to handle team contact imports
  const handleImportTeamContacts = async () => {
    try {
      const importedContacts = await importContactsFromTeam();
      
      if (importedContacts.length > 0) {
        // Create unique IDs for conversations based on contact IDs
        const newConversations: Conversation[] = importedContacts.map(contact => ({
          id: `team-${contact.id}`,
          contact: contact,
          lastMessage: {
            content: 'Conversation started',
            timestamp: new Date().toISOString(),
            isOutbound: false,
            isRead: true
          },
          chatType: 'team',
          unreadCount: 0
        }));
        
        // Filter out any existing contacts with the same ID to prevent duplicates
        const existingIds = new Set(conversations.map(conv => conv.contact.id));
        const uniqueNewConversations = newConversations.filter(
          conv => !existingIds.has(conv.contact.id)
        );
        
        if (uniqueNewConversations.length > 0) {
          setConversations(prev => [...prev, ...uniqueNewConversations]);
          toast.success(`${uniqueNewConversations.length} team contacts imported successfully`);
        } else {
          toast.info('All team contacts were already imported');
        }
      }
    } catch (error) {
      console.error('Error importing team contacts:', error);
      toast.error('Failed to import team contacts');
    }
  };

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
    handleAssignConversation,
    
    // Team import
    handleImportTeamContacts
  };
};
