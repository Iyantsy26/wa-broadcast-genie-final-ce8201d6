
import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, parseISO } from 'date-fns';
import { Conversation } from '@/types/conversation';

export const useConversationFilters = (conversations: Conversation[]) => {
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [groupedConversations, setGroupedConversations] = useState<{[name: string]: Conversation[]}>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');

  useEffect(() => {
    let filtered = [...conversations];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(convo => convo.status === statusFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(convo => 
        convo.contact.name.toLowerCase().includes(term) || 
        (convo.contact.phone && convo.contact.phone.includes(term)) ||
        convo.lastMessage.content.toLowerCase().includes(term)
      );
    }
    
    if (dateRange?.from) {
      filtered = filtered.filter(convo => {
        const messageDate = parseISO(convo.lastMessage.timestamp);
        
        if (dateRange.to) {
          return isWithinInterval(messageDate, {
            start: dateRange.from,
            end: dateRange.to
          });
        }
        
        return messageDate >= dateRange.from;
      });
    }
    
    if (assigneeFilter) {
      filtered = filtered.filter(convo => convo.assignedTo === assigneeFilter);
    }
    
    if (tagFilter) {
      filtered = filtered.filter(convo => 
        convo.tags?.includes(tagFilter)
      );
    }
    
    setFilteredConversations(filtered);
    
    const grouped = filtered.reduce((acc, conversation) => {
      const name = conversation.contact.name;
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(conversation);
      return acc;
    }, {} as {[name: string]: Conversation[]});
    
    setGroupedConversations(grouped);
  }, [conversations, statusFilter, searchTerm, dateRange, assigneeFilter, tagFilter]);

  const resetAllFilters = () => {
    setStatusFilter('all');
    setDateRange(undefined);
    setAssigneeFilter('');
    setTagFilter('');
    setSearchTerm('');
  };

  return {
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
  };
};
