
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  Conversation,
  Message,
  Contact,
  ChatType,
  MessageType,
  DateRange,
  CannedReply,
} from '@/types/conversation';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/use-user';
import { toast } from '@/hooks/use-toast';

interface ConversationContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  contacts: Contact[];
  selectedContactId: string | null;
  contactFilter: ChatType | 'all';
  searchTerm: string;
  isSidebarOpen: boolean;
  isTyping: boolean;
  isReplying: boolean;
  replyToMessage: Message | null;
  replyTo: Message | null;
  cannedReplies: CannedReply[];
  selectedDevice: string;
  aiAssistantActive: boolean;
  isAssistantActive: boolean;
  chatTypeFilter: ChatType | 'all';
  dateRange?: DateRange;
  assigneeFilter?: string;
  tagFilter?: string;
  filteredConversations: Conversation[];
  groupedConversations: { [name: string]: Conversation[] };
  wallpaper?: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  selectContact: (contactId: string) => void;
  setContactFilter: (filter: ChatType | 'all') => void;
  setSearchTerm: (term: string) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setIsTyping: (typing: boolean) => void;
  setReplyToMessage: (message: Message | null) => void;
  setReplyTo: (message: Message | null) => void;
  setSelectedDevice: (device: string) => void;
  setAiAssistantActive: (active: boolean) => void;
  setChatTypeFilter: (type: ChatType | 'all') => void;
  setDateRange: (range?: DateRange) => void;
  setAssigneeFilter: (assignee?: string) => void;
  setTagFilter: (tag?: string) => void;
  resetAllFilters: () => void;
  handleSendMessage: (
    content: string,
    type?: MessageType,
    mediaUrl?: string
  ) => Promise<void>;
  sendMessage: (content: string, type?: MessageType, mediaUrl?: string) => Promise<void>;
  handleVoiceMessageSent: (durationInSeconds: number) => void;
  sendVoiceMessage: (durationInSeconds: number) => void;
  handleDeleteConversation: (conversationId: string) => void;
  handleArchiveConversation: (
    conversationId: string,
    isArchived: boolean
  ) => void;
  handleAddReaction: (messageId: string, emoji: string) => void;
  handleReplyToMessage: (message: Message) => void;
  handleCancelReply: () => void;
  handleUseCannedReply: (reply: string) => void;
  handleRequestAIAssistance: (prompt: string) => Promise<string>;
  handleAddTag: (conversationId: string, tag: string) => void;
  handleAssignConversation: (conversationId: string, assignee: string) => void;
  handleAddContact: (contact: Partial<Contact>) => void;
  deleteMessage: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  toggleSidebar: () => void;
  toggleContactStar: (contactId: string) => void;
  toggleAssistant: () => void;
  muteContact: (contactId: string, isMuted: boolean) => void;
  archiveContact: (contactId: string) => void;
  blockContact: (contactId: string) => void;
  reportContact: (contactId: string, reason: string) => void;
  clearChat: (contactId: string) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined
);

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'John Smith',
      avatar: '/avatars/john-smith.png',
      phone: '+1 (555) 123-4567',
      type: 'client',
      isOnline: true,
      lastSeen: new Date().toISOString(),
      tags: ['premium', 'active'],
    },
    {
      id: '2',
      name: 'Jane Doe',
      avatar: '/avatars/jane-doe.png',
      phone: '+1 (555) 987-6543',
      type: 'lead',
      isOnline: false,
      lastSeen: '2023-10-01T18:45:00Z',
      tags: ['new', 'interested'],
    },
    {
      id: '3',
      name: 'Acme Corporation',
      avatar: '/avatars/acme-corp.png',
      phone: '+1 (555) 333-2222',
      type: 'client',
      isOnline: true,
      lastSeen: new Date().toISOString(),
      tags: ['enterprise', 'active'],
    },
    {
      id: '4',
      name: 'Alex Johnson',
      avatar: '/avatars/alex-johnson.png',
      phone: '+1 (555) 777-8888',
      type: 'lead',
      isOnline: false,
      lastSeen: '2023-09-30T09:20:00Z',
      tags: ['referral'],
    },
    {
      id: '5',
      name: 'Global Partners Inc',
      avatar: '/avatars/global-partners.png',
      phone: '+1 (555) 444-5555',
      type: 'client',
      isOnline: false,
      lastSeen: '2023-10-01T15:10:00Z',
      tags: ['enterprise'],
    },
    {
      id: '6',
      name: 'Team Member 1',
      avatar: '/avatars/team-member-1.png',
      phone: '+1 (555) 111-2222',
      type: 'team',
      isOnline: true,
      lastSeen: new Date().toISOString(),
      tags: ['support', 'sales'],
    },
  ]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  );
  const [contactFilter, setContactFilter] = useState<ChatType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [wallpaper, setWallpaper] = useState<string | undefined>(undefined);
  const [cannedReplies, setCannedReplies] = useState<CannedReply[]>([
    { id: uuidv4(), title: 'Greeting', content: 'Thank you for contacting us!' },
    { id: uuidv4(), title: 'Follow up', content: 'We will get back to you shortly.' },
    { id: uuidv4(), title: 'Help', content: 'How can I help you today?' },
  ]);
  const [selectedDevice, setSelectedDevice] = useState('whatsapp');
  const [aiAssistantActive, setAiAssistantActive] = useState(false);
  const [chatTypeFilter, setChatTypeFilter] = useState<ChatType | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState<string | undefined>(
    undefined
  );
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  // For compatibility with older components
  const isAssistantActive = aiAssistantActive;
  
  const toggleAssistant = () => {
    setAiAssistantActive(!aiAssistantActive);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleContactStar = (contactId: string) => {
    setContacts((prevContacts) =>
      prevContacts.map((c) =>
        c.id === contactId ? { ...c, isStarred: !c.isStarred } : c
      )
    );
  };

  const muteContact = (contactId: string, isMuted: boolean) => {
    setContacts((prevContacts) =>
      prevContacts.map((c) =>
        c.id === contactId ? { ...c, isMuted: isMuted } : c
      )
    );
  };

  const archiveContact = (contactId: string) => {
    setContacts((prevContacts) =>
      prevContacts.map((c) =>
        c.id === contactId ? { ...c, isArchived: true } : c
      )
    );
  };

  const blockContact = (contactId: string) => {
    setContacts((prevContacts) =>
      prevContacts.map((c) =>
        c.id === contactId ? { ...c, isBlocked: true } : c
      )
    );
  };

  const reportContact = (contactId: string, reason: string) => {
    console.log(`Reported contact ${contactId} for ${reason}`);
    toast({
      title: 'Contact reported',
      description: `The contact has been reported for ${reason}.`,
    });
  };

  const clearChat = (contactId: string) => {
    // Remove messages for this contact
    setMessages([]);
    toast({
      title: 'Chat cleared',
      description: 'All messages have been cleared.',
    });
  };

  useEffect(() => {
    // Fetch conversations from Supabase on mount
    const fetchConversations = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .order('last_message_timestamp', { ascending: false });

        if (error) {
          throw error;
        }

        // Transform the data into conversations
        if (data && data.length > 0) {
          const conversationsWithContacts: Conversation[] = await Promise.all(
            data.map(async (conv) => {
              const isClient = !!conv.client_id;
              const contactId = isClient ? conv.client_id : conv.lead_id;
              
              // Fetch contact details
              let contactDetails;
              if (isClient) {
                const { data: clientData } = await supabase
                  .from('clients')
                  .select('id, name, avatar_url, phone, tags')
                  .eq('id', contactId)
                  .single();
                contactDetails = clientData;
              } else {
                const { data: leadData } = await supabase
                  .from('leads')
                  .select('id, name, avatar_url, phone')
                  .eq('id', contactId)
                  .single();
                contactDetails = leadData;
              }
              
              return {
                id: conv.id,
                contact: {
                  id: contactId,
                  name: contactDetails?.name || 'Unknown Contact',
                  avatar: contactDetails?.avatar_url,
                  phone: contactDetails?.phone || '',
                  type: isClient ? 'client' : 'lead',
                  tags: contactDetails?.tags || [],
                },
                lastMessage: {
                  content: conv.last_message || '',
                  timestamp: conv.last_message_timestamp || conv.created_at,
                  isOutbound: false,
                  isRead: true
                },
                status: conv.status || 'new',
                chatType: isClient ? 'client' : 'lead',
                tags: conv.tags || [],
                assignedTo: conv.assigned_to,
                isPinned: false,
                isArchived: false,
                unreadCount: 0
              };
            })
          );
          
          setConversations(conversationsWithContacts);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversations',
          variant: 'destructive',
        });
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    // Fetch messages for the active conversation
    const fetchMessages = async () => {
      if (!activeConversation) return;

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', activeConversation.id)
          .order('timestamp', { ascending: true });

        if (error) {
          throw error;
        }

        if (data) {
          const formattedMessages: Message[] = data.map(msg => ({
            id: msg.id,
            content: msg.content || '',
            timestamp: msg.timestamp,
            isOutbound: msg.is_outbound,
            status: msg.status as MessageStatus,
            sender: msg.sender,
            type: (msg.message_type || 'text') as MessageType,
            media: msg.media_url ? {
              url: msg.media_url,
              type: (msg.media_type || 'document') as 'image' | 'video' | 'document' | 'voice',
              filename: msg.media_filename,
              duration: msg.media_duration,
            } : undefined,
          }));
          
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive',
        });
      }
    };

    if (activeConversation) {
      fetchMessages();
    }
  }, [activeConversation]);

  const filteredConversations = React.useMemo(() => {
    let filtered = conversations;

    if (chatTypeFilter !== 'all') {
      filtered = filtered.filter((c) => c.chatType === chatTypeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter((c) =>
        c.contact.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateRange?.from) {
      filtered = filtered.filter((c) => {
        const messageDate = new Date(c.lastMessage.timestamp);
        const fromDate = dateRange.from;
        const toDate = dateRange.to || new Date();
        return messageDate >= fromDate && messageDate <= toDate;
      });
    }

    if (assigneeFilter) {
      filtered = filtered.filter((c) => c.assignedTo === assigneeFilter);
    }

    if (tagFilter) {
      filtered = filtered.filter((c) => c.tags?.includes(tagFilter));
    }

    return filtered;
  }, [
    conversations,
    chatTypeFilter,
    searchTerm,
    dateRange,
    assigneeFilter,
    tagFilter,
  ]);

  const groupedConversations = React.useMemo(() => {
    const grouped: { [name: string]: Conversation[] } = {};
    filteredConversations.forEach((conversation) => {
      const date = new Date(conversation.lastMessage.timestamp).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(conversation);
    });
    return grouped;
  }, [filteredConversations]);

  const selectContact = (contactId: string) => {
    setSelectedContactId(contactId);
  };

  const handleSendMessage = async (
    content: string,
    type: MessageType = 'text',
    mediaUrl?: string
  ) => {
    if (!activeConversation) return;

    try {
      const timestamp = new Date().toISOString();

      const messageData = {
        conversation_id: activeConversation.id,
        content,
        is_outbound: true,
        timestamp,
        status: 'sent',
        sender: user?.name || 'You',
        message_type: type,
        media_url: mediaUrl || null,
        media_type: mediaUrl ? type : null,
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select();

      if (error) throw error;

      const newMessage: Message = {
        id: data?.[0]?.id || uuidv4(),
        content,
        timestamp,
        isOutbound: true,
        status: 'sent',
        sender: user?.name || 'You',
        type,
        media: mediaUrl
          ? {
              url: mediaUrl,
              type: type as 'image' | 'video' | 'document' | 'voice',
            }
          : undefined,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);

      const updatedConversation: Conversation = {
        ...activeConversation,
        lastMessage: {
          content: content || 'Attachment',
          timestamp: timestamp,
          isOutbound: true,
          isRead: false,
        },
      };

      setConversations((prevConversations) =>
        prevConversations.map((c) =>
          c.id === updatedConversation.id ? updatedConversation : c
        )
      );

      setActiveConversation(updatedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  // Alias for compatibility
  const sendMessage = handleSendMessage;

  const handleVoiceMessageSent = (durationInSeconds: number) => {
    console.log(
      `Voice message sent with duration: ${durationInSeconds} seconds`
    );
  };

  // Alias for compatibility
  const sendVoiceMessage = handleVoiceMessageSent;

  const handleDeleteConversation = (conversationId: string) => {
    setConversations((prevConversations) =>
      prevConversations.filter((c) => c.id !== conversationId)
    );
    setActiveConversation(null);
  };

  const handleArchiveConversation = (
    conversationId: string,
    isArchived: boolean
  ) => {
    setConversations((prevConversations) =>
      prevConversations.map((c) =>
        c.id === conversationId ? { ...c, isArchived: isArchived } : c
      )
    );
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    console.log(`Reaction added: ${emoji} to message ${messageId}`);
  };

  const handleReplyToMessage = (message: Message) => {
    setIsReplying(true);
    setReplyToMessage(message);
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    setIsReplying(false);
    setReplyToMessage(null);
    setReplyTo(null);
  };

  const handleUseCannedReply = (reply: string) => {
    if (replyToMessage) {
      handleSendMessage(`${replyToMessage.content} \n ${reply}`);
      handleCancelReply();
    } else {
      handleSendMessage(reply);
    }
  };

  const handleRequestAIAssistance = async (prompt: string): Promise<string> => {
    console.log(`Requesting AI assistance with prompt: ${prompt}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `AI response for: ${prompt}`;
  };

  const handleAddTag = (conversationId: string, tag: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((c) =>
        c.id === conversationId ? { ...c, tags: [...(c.tags || []), tag] } : c
      )
    );
  };

  const handleAssignConversation = (conversationId: string, assignee: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((c) =>
        c.id === conversationId ? { ...c, assignedTo: assignee } : c
      )
    );
  };

  const handleAddContact = async (contact: Partial<Contact>) => {
    if (!contact.name || !contact.phone || !contact.type) {
      console.error('Name, phone, and type are required to add a contact.');
      return;
    }

    const newContact: Contact = {
      id: uuidv4(),
      name: contact.name,
      phone: contact.phone,
      type: contact.type,
      avatar: contact.avatar || '',
      isOnline: false,
      lastSeen: new Date().toISOString(),
      tags: contact.tags || [],
    };

    setContacts((prevContacts) => [...prevContacts, newContact]);
  };

  const deleteMessage = (messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== messageId)
    );
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              reactions: [
                ...(message.reactions || []),
                {
                  emoji,
                  userId: user?.id || 'temp-user',
                  userName: user?.name || 'You',
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : message
      )
    );
  };

  const resetAllFilters = () => {
    setChatTypeFilter('all');
    setSearchTerm('');
    setDateRange(undefined);
    setAssigneeFilter(undefined);
    setTagFilter(undefined);
  };

  const value = {
    conversations,
    activeConversation,
    messages,
    contacts,
    selectedContactId,
    contactFilter,
    searchTerm,
    isSidebarOpen,
    isTyping,
    isReplying,
    replyToMessage,
    replyTo,
    cannedReplies,
    selectedDevice,
    aiAssistantActive,
    isAssistantActive,
    chatTypeFilter,
    dateRange,
    assigneeFilter,
    tagFilter,
    filteredConversations,
    groupedConversations,
    wallpaper,
    messagesEndRef,
    selectContact,
    setContactFilter,
    setSearchTerm,
    setActiveConversation,
    setIsSidebarOpen,
    setIsTyping,
    setReplyToMessage,
    setReplyTo,
    setSelectedDevice,
    setAiAssistantActive,
    setChatTypeFilter,
    setDateRange,
    setAssigneeFilter,
    setTagFilter,
    resetAllFilters,
    handleSendMessage,
    sendMessage,
    handleVoiceMessageSent,
    sendVoiceMessage,
    handleDeleteConversation,
    handleArchiveConversation,
    handleAddReaction,
    handleReplyToMessage,
    handleCancelReply,
    handleUseCannedReply,
    handleRequestAIAssistance,
    handleAddTag,
    handleAssignConversation,
    handleAddContact,
    deleteMessage,
    addReaction,
    toggleSidebar,
    toggleContactStar,
    toggleAssistant,
    muteContact,
    archiveContact,
    blockContact,
    reportContact,
    clearChat,
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
    throw new Error(
      'useConversation must be used within a ConversationProvider'
    );
  }
  return context;
};
