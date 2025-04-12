
import { useState, useMemo } from 'react';
import { Conversation, ChatType } from '@/types/conversation';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, parseISO } from 'date-fns';

export const useConversationFilters = (conversations: Conversation[]) => {
  const [chatTypeFilter, setChatTypeFilter] = useState<ChatType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const filteredConversations = useMemo(() => {
    console.log('Filtering conversations with type filter:', chatTypeFilter);
    console.log('Available conversations before filtering:', conversations.length);
    
    console.log('Count by type before filtering:', {
      all: conversations.length,
      team: conversations.filter(c => c.chatType === 'team').length,
      client: conversations.filter(c => c.chatType === 'client').length,
      lead: conversations.filter(c => c.chatType === 'lead').length
    });
    
    return conversations.filter(conversation => {
      // Log current conversation being filtered
      console.log(`Checking conversation with type: ${conversation.chatType}`, conversation);
      
      // Filter by chat type
      if (chatTypeFilter !== 'all' && conversation.chatType !== chatTypeFilter) {
        console.log(`Filtered out - type mismatch: ${conversation.chatType} !== ${chatTypeFilter}`);
        return false;
      }
      
      // Filter by search term
      if (searchTerm && !conversation.contact.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by date range
      if (dateRange?.from && conversation.lastMessage?.timestamp) {
        const messageDate = parseISO(conversation.lastMessage.timestamp);
        const fromDate = dateRange.from;
        const toDate = dateRange.to || dateRange.from;
        
        if (!isWithinInterval(messageDate, { start: fromDate, end: toDate })) {
          return false;
        }
      }
      
      // Filter by assignee
      if (assigneeFilter && conversation.assignedTo !== assigneeFilter) {
        return false;
      }
      
      // Filter by tag
      if (tagFilter && (!conversation.tags || !conversation.tags.includes(tagFilter))) {
        return false;
      }
      
      return true;
    });
  }, [conversations, chatTypeFilter, searchTerm, dateRange, assigneeFilter, tagFilter]);
  
  console.log('Filtered conversations:', filteredConversations.length);
  console.log('Filtered conversations by type:', {
    team: filteredConversations.filter(c => c.chatType === 'team').length,
    client: filteredConversations.filter(c => c.chatType === 'client').length,
    lead: filteredConversations.filter(c => c.chatType === 'lead').length
  });

  // Group conversations by date or another criteria
  const groupedConversations = useMemo(() => {
    const groups: { [key: string]: Conversation[] } = {};
    
    // Add specific groups for each chat type
    groups['Team'] = [];
    groups['Clients'] = [];
    groups['Leads'] = [];
    
    filteredConversations.forEach(conversation => {
      // Group by chat type
      if (conversation.chatType === 'team') {
        groups['Team'].push(conversation);
      } else if (conversation.chatType === 'client') {
        groups['Clients'].push(conversation);
      } else if (conversation.chatType === 'lead') {
        groups['Leads'].push(conversation);
      }
    });
    
    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });
    
    console.log('Grouped conversations:', groups);
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
  };
};
