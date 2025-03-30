
import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { useConversations } from '@/hooks/useConversations';
import { Conversation, Message } from '@/types/conversation';
import { DateRange } from 'react-day-picker';

interface ConversationContextType {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  groupedConversations: {[name: string]: Conversation[]};
  activeConversation: Conversation | null;
  messages: Message[];
  isSidebarOpen: boolean;
  statusFilter: string;
  searchTerm: string;
  dateRange?: DateRange;
  assigneeFilter: string;
  tagFilter: string;
  setActiveConversation: (conversation: Conversation) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setStatusFilter: (status: string) => void;
  setSearchTerm: (term: string) => void;
  setDateRange: (range?: DateRange) => void;
  setAssigneeFilter: (assignee: string) => void;
  setTagFilter: (tag: string) => void;
  resetAllFilters: () => void;
  handleSendMessage: (content: string, file: File | null) => void;
  handleVoiceMessageSent: (durationInSeconds: number) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const conversationsState = useConversations();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationsState.messages]);

  return (
    <ConversationContext.Provider value={{
      ...conversationsState,
      messagesEndRef
    }}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};
