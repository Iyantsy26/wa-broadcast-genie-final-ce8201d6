import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { Contact, Message, MessageStatus, ChatType, Conversation } from '@/types/conversation';
import { getLeads } from '@/services/leadService';
import { getClients } from '@/services/clientService';
import { toast } from '@/hooks/use-toast';

export type MessageMap = Record<string, Message[]>;

interface ConversationContextType {
  contacts: Contact[];
  filteredContacts: Contact[];
  selectedContactId: string | null;
  messages: MessageMap;
  isTyping: boolean;
  replyTo: Message | null;
  isSidebarOpen: boolean;
  isAssistantActive: boolean;
  wallpaper: string | null;
  contactFilter: ChatType | 'all';
  searchTerm: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  
  filteredConversations: Conversation[];
  groupedConversations: Record<string, Conversation[]>;
  activeConversation: Conversation | null;
  isReplying: boolean;
  replyToMessage: Message | null;
  cannedReplies: { id: string; title: string; content: string }[];
  selectedDevice: string;
  aiAssistantActive: boolean;
  chatTypeFilter: ChatType | 'all';
  dateRange: DateRange | undefined;
  assigneeFilter: string | undefined;
  tagFilter: string | undefined;
  
  selectContact: (contactId: string) => void;
  toggleSidebar: () => void;
  toggleAssistant: () => void;
  sendMessage: (contactId: string, content: string, deviceId: string) => void;
  sendVoiceMessage: (contactId: string, durationInSeconds: number, deviceId: string) => void;
  setReplyTo: (message: Message | null) => void;
  setWallpaper: (url: string | null) => void;
  filterContacts: (
    searchQuery: string,
    type?: ChatType | 'all',
    isOnlineOnly?: boolean,
    isUnreadOnly?: boolean
  ) => void;
  setContactFilter: (filter: ChatType | 'all') => void;
  setSearchTerm: (term: string) => void;
  addContact: (contact: Contact) => void;
  
  setActiveConversation: (conversation: Conversation) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setSelectedDevice: (deviceId: string) => void;
  setAiAssistantActive: (isActive: boolean) => void;
  setChatTypeFilter: (filter: ChatType | 'all') => void;
  setDateRange: (range: DateRange | undefined) => void;
  setAssigneeFilter: (assignee: string | undefined) => void;
  setTagFilter: (tag: string | undefined) => void;
  resetAllFilters: () => void;
  handleSendMessage: (content: string, file: File | null, replyToMessageId?: string) => void;
  handleVoiceMessageSent: (durationInSeconds: number) => void;
  handleDeleteConversation: (conversationId: string) => void;
  handleArchiveConversation: (conversationId: string, isArchived: boolean) => void;
  handleAddTag: (conversationId: string, tag: string) => void;
  handleAssignConversation: (conversationId: string, assignee: string) => void;
  handleAddReaction: (messageId: string, emoji: string) => void;
  handleReplyToMessage: (message: Message) => void;
  handleCancelReply: () => void;
  handleUseCannedReply: (replyContent: string) => void;
  handleRequestAIAssistance: () => void;
  handleAddContact: (contact: Contact) => void;
  toggleContactStar: (contactId: string) => void;
  muteContact: (contactId: string, isMuted: boolean) => void;
  clearChat: (contactId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  deleteMessage: (messageId: string) => void;
  blockContact: (contactId: string, isBlocked: boolean) => void;
}

interface ConversationProviderProps {
  children: React.ReactNode;
  initialContacts?: Contact[];
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider: React.FC<ConversationProviderProps> = ({ children, initialContacts = [] }) => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>(initialContacts);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageMap>({});
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAssistantActive, setIsAssistantActive] = useState(false);
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const [contactFilter, setContactFilter] = useState<ChatType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [groupedConversations, setGroupedConversations] = useState<Record<string, Conversation[]>>({});
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [cannedReplies, setCannedReplies] = useState<{ id: string; title: string; content: string }[]>([
    { id: '1', title: 'Greeting', content: 'Hello! How can I help you today?' },
    { id: '2', title: 'Thank you', content: 'Thank you for your message. We appreciate your business.' },
    { id: '3', title: 'Closing', content: 'Let me know if you have any other questions!' },
  ]);
  const [selectedDevice, setSelectedDevice] = useState('1');
  const [aiAssistantActive, setAiAssistantActive] = useState(false);
  const [chatTypeFilter, setChatTypeFilter] = useState<ChatType | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState<string | undefined>(undefined);
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        
        const leads = await getLeads();
        const leadContacts: Contact[] = leads.map(lead => ({
          id: lead.id,
          name: lead.name,
          avatar: lead.avatar_url,
          phone: lead.phone || '',
          type: 'lead' as ChatType,
          isOnline: false,
          lastSeen: lead.last_contact || new Date().toISOString(),
          tags: lead.status ? [lead.status] : []
        }));
        
        const clients = await getClients();
        const clientContacts: Contact[] = clients.map(client => ({
          id: client.id,
          name: client.name,
          avatar: client.avatar_url,
          phone: client.phone || '',
          type: 'client' as ChatType,
          isOnline: false,
          lastSeen: client.join_date || new Date().toISOString(),
          tags: client.tags || []
        }));

        const teamContacts: Contact[] = [];

        const allContacts = [...leadContacts, ...clientContacts, ...teamContacts];
        setContacts(allContacts);
        setFilteredContacts(allContacts);

        toast({
          title: 'Contacts loaded',
          description: `${allContacts.length} contacts loaded successfully`,
        });
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load contacts',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (initialContacts.length === 0) {
      fetchContacts();
    }
  }, [initialContacts]);

  const selectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setIsSidebarOpen(false);
    
    if (!messages[contactId]) {
      setMessages(prev => ({
        ...prev,
        [contactId]: []
      }));
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const toggleAssistant = () => {
    setIsAssistantActive(prev => !prev);
  };

  const sendMessage = (contactId: string, content: string, deviceId: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      sender: `You (Device #${deviceId})`,
      type: 'text'
    };
    
    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMessage]
    }));
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    setTimeout(() => {
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        
        const responseMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          content: `This is a response to "${content}" from device #${deviceId}`,
          timestamp: new Date().toISOString(),
          isOutbound: false,
          status: 'delivered',
          sender: contacts.find(c => c.id === contactId)?.name || 'Unknown',
          type: 'text'
        };
        
        setMessages(prev => ({
          ...prev,
          [contactId]: [...(prev[contactId] || []), responseMessage]
        }));
        
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }, 2000);
    }, 1000);
  };

  const sendVoiceMessage = (contactId: string, durationInSeconds: number, deviceId: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: `Voice message (${durationInSeconds} seconds)`,
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      sender: `You (Device #${deviceId})`,
      type: 'voice',
      media: {
        url: '#',
        type: 'voice',
        duration: durationInSeconds
      }
    };
    
    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMessage]
    }));
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const filterContacts = (
    searchQuery: string,
    type: ChatType | 'all' = 'all',
    isOnlineOnly = false,
    isUnreadOnly = false
  ) => {
    let filtered = contacts;
    
    if (searchQuery) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (type !== 'all') {
      filtered = filtered.filter(contact => contact.type === type);
    }
    
    if (isOnlineOnly) {
      filtered = filtered.filter(contact => contact.isOnline);
    }
    
    setFilteredContacts(filtered);
    setSearchTerm(searchQuery);
    setContactFilter(type);
  };

  const addContact = (contact: Contact) => {
    setContacts(prev => [...prev, contact]);
    setFilteredContacts(prev => [...prev, contact]);
    toast({
      title: "Contact added",
      description: `${contact.name} has been added successfully.`,
    });
  };

  const blockContact = (contactId: string, isBlocked: boolean) => {
    setContacts(contacts.map(contact => {
      if (contact.id === contactId) {
        if (contact.type === 'client') {
          // For clients, use tags
          const updatedTags = isBlocked
            ? [...(contact.tags || []), 'blocked'] 
            : (contact.tags || []).filter(tag => tag !== 'blocked');
          
          return { ...contact, tags: updatedTags, isBlocked };
        } else if (contact.type === 'lead') {
          // For leads, use status
          return { 
            ...contact, 
            status: isBlocked ? 'blocked' : 'active',
            isBlocked 
          };
        } else {
          // For team and others
          return { ...contact, isBlocked };
        }
      }
      return contact;
    }));
    
    toast({
      title: isBlocked ? 'Contact blocked' : 'Contact unblocked',
      description: `The contact has been ${isBlocked ? 'blocked' : 'unblocked'}.`,
    });
  };

  const handleSendMessage = (content: string, file: File | null, replyToMessageId?: string) => {
    if (activeConversation && content.trim()) {
      sendMessage(activeConversation.contact.id, content, selectedDevice);
      setReplyToMessage(null);
      setIsReplying(false);
    }
  };

  const handleVoiceMessageSent = (durationInSeconds: number) => {
    if (activeConversation) {
      sendVoiceMessage(activeConversation.contact.id, durationInSeconds, selectedDevice);
    }
  };

  const handleDeleteConversation = (conversationId: string) => {
    console.log('Delete conversation:', conversationId);
  };

  const handleArchiveConversation = (conversationId: string, isArchived: boolean) => {
    console.log('Archive conversation:', conversationId, isArchived);
  };

  const handleAddTag = (conversationId: string, tag: string) => {
    console.log('Add tag:', conversationId, tag);
  };

  const handleAssignConversation = (conversationId: string, assignee: string) => {
    console.log('Assign conversation:', conversationId, assignee);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    console.log('Add reaction:', messageId, emoji);
    addReaction(messageId, emoji);
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyToMessage(message);
    setIsReplying(true);
  };

  const handleCancelReply = () => {
    setReplyToMessage(null);
    setIsReplying(false);
  };

  const handleUseCannedReply = (replyContent: string) => {
    if (activeConversation) {
      sendMessage(activeConversation.contact.id, replyContent, selectedDevice);
    }
  };

  const handleRequestAIAssistance = () => {
    console.log('AI assistance requested');
    toast({
      title: 'AI Assistant',
      description: 'Generating a response...',
    });
    setTimeout(() => {
      if (activeConversation) {
        sendMessage(
          activeConversation.contact.id,
          'This is an AI-generated response to help with your query.',
          selectedDevice
        );
      }
    }, 2000);
  };

  const handleAddContact = (contact: Contact) => {
    addContact(contact);
  };

  const resetAllFilters = () => {
    setChatTypeFilter('all');
    setSearchTerm('');
    setDateRange(undefined);
    setAssigneeFilter(undefined);
    setTagFilter(undefined);
  };

  const toggleContactStar = (contactId: string) => {
    setContacts(contacts.map(contact => 
      contact.id === contactId 
        ? { ...contact, isStarred: !contact.isStarred }
        : contact
    ));
  };

  const muteContact = (contactId: string, isMuted: boolean) => {
    setContacts(contacts.map(contact => 
      contact.id === contactId 
        ? { ...contact, isMuted }
        : contact
    ));
  };

  const clearChat = (contactId: string) => {
    setMessages(prev => ({
      ...prev,
      [contactId]: []
    }));
    toast({
      title: 'Chat cleared',
      description: 'All messages have been removed from this conversation',
    });
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!selectedContactId) return;
    
    setMessages(prev => {
      const contactMessages = prev[selectedContactId] || [];
      return {
        ...prev,
        [selectedContactId]: contactMessages.map(msg => 
          msg.id === messageId ? {
            ...msg,
            reactions: [
              ...(msg.reactions || []),
              { 
                emoji, 
                userId: 'current-user', 
                userName: 'You',
                timestamp: new Date().toISOString()
              }
            ]
          } : msg
        )
      };
    });
  };

  const deleteMessage = (messageId: string) => {
    if (!selectedContactId) return;
    
    setMessages(prev => {
      const contactMessages = prev[selectedContactId] || [];
      return {
        ...prev,
        [selectedContactId]: contactMessages.filter(msg => msg.id !== messageId)
      };
    });
  };

  const value: ConversationContextType = {
    contacts,
    filteredContacts,
    selectedContactId,
    messages,
    isTyping,
    replyTo,
    isSidebarOpen,
    isAssistantActive,
    wallpaper,
    contactFilter,
    searchTerm,
    messagesEndRef,
    
    filteredConversations,
    groupedConversations,
    activeConversation,
    isReplying,
    replyToMessage,
    cannedReplies,
    selectedDevice,
    aiAssistantActive,
    chatTypeFilter,
    dateRange,
    assigneeFilter,
    tagFilter,
    
    selectContact,
    toggleSidebar,
    toggleAssistant,
    sendMessage,
    sendVoiceMessage,
    setReplyTo,
    setWallpaper,
    filterContacts,
    setContactFilter,
    setSearchTerm,
    addContact,
    
    setActiveConversation,
    setIsSidebarOpen,
    setSelectedDevice,
    setAiAssistantActive,
    setChatTypeFilter,
    setDateRange,
    setAssigneeFilter,
    setTagFilter,
    resetAllFilters,
    handleSendMessage,
    handleVoiceMessageSent,
    handleDeleteConversation,
    handleArchiveConversation,
    handleAddTag,
    handleAssignConversation,
    handleAddReaction,
    handleReplyToMessage,
    handleCancelReply,
    handleUseCannedReply,
    handleRequestAIAssistance,
    handleAddContact,
    
    toggleContactStar,
    muteContact,
    clearChat,
    
    addReaction,
    deleteMessage,
    blockContact
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = (): ConversationContextType => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};
