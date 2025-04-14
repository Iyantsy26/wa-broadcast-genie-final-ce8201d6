
import { useConversationState } from './conversations/useConversationState';
import { useConversationFilters } from './conversations/useConversationFilters';
import { useConversationMessages } from './conversations/useConversationMessages';
import { useConversationActions } from './conversations/useConversationActions';
import { useState, useEffect } from 'react';
import { Conversation, Contact, ChatType } from '@/types/conversation';
import { importContactsFromTeam } from '@/services/contactService';
import { toast } from '@/hooks/use-toast';

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

  // Enhanced function to handle team contact imports
  const handleImportTeamContacts = async () => {
    try {
      toast({
        title: 'Importing team members',
        description: 'Please wait while we import your team members to conversations...',
      });
      
      const importedContacts = await importContactsFromTeam();
      
      if (importedContacts.length > 0) {
        // Convert imported contacts to conversations
        const newConversations: Conversation[] = importedContacts.map(contact => ({
          id: `team-${contact.id}`,
          contact: {
            ...contact,
            avatar: '', // Set empty avatar to avoid 404 errors
          },
          lastMessage: {
            content: 'Team messaging available',
            timestamp: new Date().toISOString(),
            isOutbound: false,
            isRead: true
          },
          chatType: 'team',
          status: 'open',
          tags: [],
          assignedTo: '',
          isEncrypted: false,
          isPinned: false,
          isArchived: false,
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
        
        toast({
          title: 'Team members imported',
          description: `${importedContacts.length} team members imported successfully`,
        });
      } else {
        toast({
          title: 'No team members found',
          description: 'Check your team_members table in Supabase',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error importing team contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to import team members',
        variant: 'destructive',
      });
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
