
import { useConversationState } from './conversations/useConversationState';
import { useConversationFilters } from './conversations/useConversationFilters';
import { useConversationMessages } from './conversations/useConversationMessages';
import { useConversationActions } from './conversations/useConversationActions';
import { useState, useEffect } from 'react';
import { Conversation, Contact, ChatType } from '@/types/conversation';
import { importContactsFromTeam } from '@/services/contactService';

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
        // Convert imported contacts to conversations
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
        
        // Add the new conversations, avoiding duplicates
        setConversations(prev => {
          // Filter out any existing conversations with the same team_member_id
          const filteredPrev = prev.filter(conversation => 
            conversation.chatType !== 'team' || 
            !newConversations.some(newConv => 
              newConv.contact.id === conversation.contact.id
            )
          );
          
          return [...filteredPrev, ...newConversations];
        });
      }
    } catch (error) {
      console.error('Error importing team contacts:', error);
    }
  };

  // Auto-import team contacts on component mount
  useEffect(() => {
    handleImportTeamContacts();
  }, []);

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
