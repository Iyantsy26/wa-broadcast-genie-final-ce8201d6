
import React from 'react';
import { Conversation, ChatType } from '@/types/conversation';
import { DateRange } from 'react-day-picker';
import ConversationFilters from './ConversationFilters';
import ActiveFilterBadges from './ActiveFilterBadges';
import ConversationItem from './ConversationItem';
import EmptyConversations from './EmptyConversations';

interface ConversationListProps {
  conversations: Conversation[];
  groupedConversations: {[name: string]: Conversation[]};
  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation) => void;
  chatTypeFilter: ChatType | 'all';
  setChatTypeFilter: (type: ChatType | 'all') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange?: DateRange;
  setDateRange?: (range: DateRange | undefined) => void;
  assigneeFilter?: string;
  setAssigneeFilter?: (assignee: string) => void;
  tagFilter?: string;
  setTagFilter?: (tag: string) => void;
  resetAllFilters: () => void;
  pinConversation: (conversationId: string, isPinned: boolean) => void;
  archiveConversation: (conversationId: string, isArchived: boolean) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  groupedConversations,
  activeConversation,
  setActiveConversation,
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
  pinConversation,
  archiveConversation
}) => {
  const assignees = Array.from(new Set(conversations.filter(c => c.assignedTo).map(c => c.assignedTo as string)));
  const tags = Array.from(new Set(conversations.flatMap(c => c.tags || [])));

  // Filter conversations based on contact type
  const displayConversations = React.useMemo(() => {
    if (chatTypeFilter === 'all') {
      return conversations;
    }
    return conversations.filter(c => c.chatType === chatTypeFilter);
  }, [conversations, chatTypeFilter]);

  return (
    <div className="w-1/3 flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden">
      <ConversationFilters 
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
        assignees={assignees}
        tags={tags}
        resetAllFilters={resetAllFilters}
      />
      
      <ActiveFilterBadges 
        chatTypeFilter={chatTypeFilter}
        dateRange={dateRange}
        assigneeFilter={assigneeFilter}
        tagFilter={tagFilter}
        setChatTypeFilter={setChatTypeFilter}
        setDateRange={setDateRange}
        setAssigneeFilter={setAssigneeFilter}
        setTagFilter={setTagFilter}
      />
      
      <div className="flex-1 overflow-auto">
        {Object.keys(groupedConversations).length > 0 ? (
          Object.entries(groupedConversations).map(([name, groupConversations]) => {
            // Filter by contact type
            const filteredGroupConversations = chatTypeFilter === 'all'
              ? groupConversations
              : groupConversations.filter(c => c.chatType === chatTypeFilter);
              
            if (filteredGroupConversations.length === 0) return null;
            
            return (
              <div key={name} className="mb-2">
                <div className="px-3 py-1 bg-muted font-medium text-sm sticky top-0">
                  {name} ({filteredGroupConversations.length})
                </div>
                {filteredGroupConversations.map((conversation) => (
                  <ConversationItem 
                    key={conversation.id}
                    conversation={conversation}
                    isActive={activeConversation?.id === conversation.id}
                    onClick={() => setActiveConversation(conversation)}
                  />
                ))}
              </div>
            );
          })
        ) : (
          <EmptyConversations resetAllFilters={resetAllFilters} />
        )}
      </div>
    </div>
  );
};

export default ConversationList;
