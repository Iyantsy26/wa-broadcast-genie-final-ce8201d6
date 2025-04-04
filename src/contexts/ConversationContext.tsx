
import React, { createContext, useContext, ReactNode, useRef } from 'react';
import { useConversations } from '@/hooks/useConversations';
import { Conversation, Message, Contact } from '@/types/conversation';
import { DateRange } from 'react-day-picker';

interface ConversationContextType {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  groupedConversations: {[name: string]: Conversation[]};
  activeConversation: Conversation | null;
  messages: Message[];
  isSidebarOpen: boolean;
  isTyping: boolean;
  statusFilter: string;
  searchTerm: string;
  dateRange?: DateRange;
  assigneeFilter: string;
  tagFilter: string;
  isReplying: boolean;
  replyToMessage: Message | null;
  cannedReplies: { id: string; title: string; content: string }[];
  selectedDevice: string;
  aiAssistantActive: boolean;
  
  // Methods
  setActiveConversation: (conversation: Conversation) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setStatusFilter: (status: string) => void;
  setSearchTerm: (term: string) => void;
  setDateRange: (range?: DateRange) => void;
  setAssigneeFilter: (assignee: string) => void;
  setTagFilter: (tag: string) => void;
  setSelectedDevice: (deviceId: string) => void;
  setAiAssistantActive: (active: boolean) => void;
  resetAllFilters: () => void;
  
  // Message actions
  handleSendMessage: (content: string, file: File | null) => void;
  handleVoiceMessageSent: (durationInSeconds: number) => void;
  handleAddReaction: (messageId: string, emoji: string) => void;
  handleReplyToMessage: (message: Message) => void;
  handleCancelReply: () => void;
  
  // Conversation actions
  handleDeleteConversation: (conversationId: string) => Promise<void>;
  handleArchiveConversation: (conversationId: string) => Promise<void>;
  handleAddTag: (conversationId: string, tag: string) => Promise<void>;
  handleAssignConversation: (conversationId: string, assignee: string) => Promise<void>;
  handleUseCannedReply: (replyId: string) => void;
  handleTranslateMessage: (messageId: string, targetLanguage: string) => void;
  handleRequestAIAssistance: (prompt: string) => Promise<string>;
  
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const conversationsState = useConversations();
  const [isTyping, setIsTyping] = React.useState<boolean>(false);
  const [isReplying, setIsReplying] = React.useState<boolean>(false);
  const [replyToMessage, setReplyToMessage] = React.useState<Message | null>(null);
  const [selectedDevice, setSelectedDevice] = React.useState<string>('');
  const [aiAssistantActive, setAiAssistantActive] = React.useState<boolean>(false);
  
  // Mock canned replies
  const [cannedReplies] = React.useState([
    { id: '1', title: 'Greeting', content: 'Hello! How may I assist you today?' },
    { id: '2', title: 'Thank You', content: 'Thank you for reaching out. We appreciate your business!' },
    { id: '3', title: 'Follow-up', content: 'I wanted to follow up on our previous conversation. Do you have any questions?' },
    { id: '4', title: 'Help', content: 'Is there anything else I can help you with today?' },
  ]);

  // Handle reply to message
  const handleReplyToMessage = (message: Message) => {
    setReplyToMessage(message);
    setIsReplying(true);
  };

  // Handle cancel reply
  const handleCancelReply = () => {
    setReplyToMessage(null);
    setIsReplying(false);
  };
  
  // Handle using a canned reply
  const handleUseCannedReply = (replyId: string) => {
    const reply = cannedReplies.find(r => r.id === replyId);
    if (reply && conversationsState.activeConversation) {
      conversationsState.handleSendMessage(reply.content, null);
    }
  };
  
  // Mock translation feature
  const handleTranslateMessage = (messageId: string, targetLanguage: string) => {
    console.log(`Translating message ${messageId} to ${targetLanguage}`);
    // In a real implementation, this would call a translation API
  };
  
  // Mock AI assistance
  const handleRequestAIAssistance = async (prompt: string): Promise<string> => {
    console.log(`Requesting AI assistance with prompt: ${prompt}`);
    // Mock response for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "This is a response from the AI assistant. In a real implementation, this would come from an AI service.";
  };
  
  // Simulate typing indicator when sending messages
  React.useEffect(() => {
    if (conversationsState.messages.length > 0) {
      const lastMessage = conversationsState.messages[conversationsState.messages.length - 1];
      if (lastMessage.isOutbound) {
        setIsTyping(true);
        const timer = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [conversationsState.messages]);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    conversationsState.messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationsState.messages]);

  return (
    <ConversationContext.Provider value={{
      ...conversationsState,
      isTyping,
      isReplying,
      replyToMessage,
      cannedReplies,
      selectedDevice,
      setSelectedDevice,
      aiAssistantActive,
      setAiAssistantActive,
      handleReplyToMessage,
      handleCancelReply,
      handleUseCannedReply,
      handleTranslateMessage,
      handleRequestAIAssistance,
      handleAddReaction: (messageId, emoji) => {
        console.log(`Adding reaction ${emoji} to message ${messageId}`);
        // In a real implementation, this would update the message
      }
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
