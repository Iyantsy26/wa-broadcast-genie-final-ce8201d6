
import { useMemo, useState } from 'react';
import { Conversation, ChatType } from '@/types/conversation';
import { DateRange } from 'react-day-picker';

export const useConversationFilters = (conversations: Conversation[]) => {
  const [chatTypeFilter, setChatTypeFilter] = useState<ChatType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  // Apply all filters
  const filteredConversations = useMemo(() => {
    return conversations.filter(conversation => {
      // Type filter
      if (chatTypeFilter !== 'all' && conversation.chatType !== chatTypeFilter) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = conversation.contact.name.toLowerCase().includes(searchLower);
        const contentMatch = conversation.lastMessage.content.toLowerCase().includes(searchLower);
        const phoneMatch = conversation.contact.phone?.toLowerCase().includes(searchLower) || false;

        if (!nameMatch && !contentMatch && !phoneMatch) {
          return false;
        }
      }

      // Date filter
      if (dateRange?.from) {
        const msgDate = new Date(conversation.lastMessage.timestamp);
        if (dateRange.from && msgDate < dateRange.from) {
          return false;
        }
        if (dateRange.to && msgDate > dateRange.to) {
          return false;
        }
      }

      // Assignee filter
      if (assigneeFilter && conversation.assignedTo !== assigneeFilter) {
        return false;
      }

      // Tag filter
      if (tagFilter && (!conversation.tags || !conversation.tags.includes(tagFilter))) {
        return false;
      }

      return true;
    });
  }, [
    conversations,
    chatTypeFilter,
    searchTerm,
    dateRange,
    assigneeFilter,
    tagFilter,
  ]);

  // Group conversations
  const groupedConversations = useMemo(() => {
    const groups: Record<string, Conversation[]> = {
      'Pinned': [],
      'Active': [],
      'Others': [],
    };

    filteredConversations.forEach(conversation => {
      if (conversation.isPinned) {
        groups['Pinned'].push(conversation);
      } else if (conversation.chatType === 'client') {
        groups['Active'].push(conversation);
      } else {
        groups['Others'].push(conversation);
      }
    });

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  }, [filteredConversations]);

  const resetAllFilters = () => {
    setChatTypeFilter('all');
    setSearchTerm('');
    setDateRange(undefined);
    setAssigneeFilter('');
    setTagFilter('');
  };

  return {
    filteredConversations,
    groupedConversations,
    chatTypeFilter,
    setChatTypeFilter,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    assigneeFilter,
    setAssigneeFilter,
    tagFilter,
    setTagFilter,
    resetAllFilters,
  };
};
