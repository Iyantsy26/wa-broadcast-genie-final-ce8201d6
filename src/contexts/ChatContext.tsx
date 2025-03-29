import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, parseISO } from 'date-fns';
import { Conversation, Message, ChatType, Contact, MessageType } from '@/types/conversation';
import { toast } from "@/hooks/use-toast";

// Sample data - normally this would come from an API
const initialTeamContacts: Contact[] = [
  {
    id: 't1',
    name: 'Maria Lopez',
    phone: '+1 555-123-0001',
    avatar: '',
    isOnline: true,
    role: 'Team Lead',
    type: 'team',
  },
  {
    id: 't2',
    name: 'Robert Chen',
    phone: '+1 555-123-0002',
    avatar: '',
    isOnline: false,
    lastSeen: '2023-06-23T10:30:00Z',
    role: 'Support Agent',
    type: 'team',
  },
];

const initialClientContacts: Contact[] = [
  {
    id: 'c1',
    name: 'Sarah Johnson',
    phone: '+1 555-123-4567',
    avatar: '',
    isOnline: true,
    type: 'client',
  },
  {
    id: 'c2',
    name: 'David Williams',
    phone: '+1 555-987-6543',
    avatar: '',
    type: 'client',
  },
];

const initialLeadContacts: Contact[] = [
  {
    id: 'l1',
    name: 'Michael Brown',
    phone: '+1 555-567-8901',
    avatar: '',
    type: 'lead',
  },
  {
    id: 'l2',
    name: 'Emily Davis',
    phone: '+1 555-345-6789',
    avatar: '',
    type: 'lead',
  },
];

const allContacts = [...initialTeamContacts, ...initialClientContacts, ...initialLeadContacts];

const initialConversations: Conversation[] = allContacts.map((contact, index) => ({
  id: contact.id,
  contact,
  lastMessage: {
    content: `Latest message from ${contact.name}...`,
    timestamp: new Date(Date.now() - index * 3600000).toISOString(),
    isOutbound: index % 3 === 0,
    isRead: index % 2 === 0,
  },
  assignedTo: index % 4 === 0 ? 'Maria Lopez' : index % 4 === 1 ? 'Robert Chen' : undefined,
  tags: contact.type === 'lead' ? ['new-lead', 'potential'] : 
         contact.type === 'client' ? ['active-client', 'support'] : ['team', 'internal'],
  status: index % 4 === 0 ? 'active' : index % 4 === 1 ? 'new' : index % 4 === 2 ? 'waiting' : 'resolved',
  unreadCount: index % 3 === 0 ? 0 : Math.floor(Math.random() * 5) + 1,
  isPinned: index === 0,
  isArchived: false,
  isEncrypted: contact.type === 'client',
  chatType: contact.type,
}));

const initialMessages: Message[] = [
  {
    id: '1',
    content: "Hello! I'm interested in your services.",
    timestamp: '2023-06-23T09:30:00Z',
    isOutbound: false,
    viaWhatsApp: true,
  },
  {
    id: '2',
    content: 'Thanks for reaching out! How can we help you today?',
    timestamp: '2023-06-23T09:32:00Z',
    isOutbound: true,
    status: 'read',
    sender: 'Maria Lopez',
    senderId: 't1',
  },
  {
    id: '3',
    content: "I'd like to book an appointment for a consultation.",
    timestamp: '2023-06-23T09:35:00Z',
    isOutbound: false,
    viaWhatsApp: true,
  },
  {
    id: '4',
    content: 'Sure, we have availability next week. What day works best for you?',
    timestamp: '2023-06-23T09:38:00Z',
    isOutbound: true,
    status: 'read',
    sender: 'Maria Lopez',
    senderId: 't1',
  },
  {
    id: '5',
    content: "I'd prefer Tuesday afternoon if possible.",
    timestamp: '2023-06-23T09:40:00Z',
    isOutbound: false,
    viaWhatsApp: true,
  },
  {
    id: '6',
    content: 'Great! We have an opening at 2 PM or 4 PM on Tuesday. Which would you prefer?',
    timestamp: '2023-06-23T09:42:00Z',
    isOutbound: true,
    status: 'read',
    sender: 'Maria Lopez',
    senderId: 't1',
    reactions: [
      {
        emoji: '👍',
        userId: 'c1',
        userName: 'Sarah Johnson',
        timestamp: '2023-06-23T09:43:00Z',
      }
    ]
  },
  {
    id: '7',
    content: '2 PM works perfectly for me.',
    timestamp: '2023-06-23T09:45:00Z',
    isOutbound: false,
    viaWhatsApp: true,
  },
  {
    id: '8',
    content: '',
    timestamp: '2023-06-23T09:47:00Z',
    isOutbound: true,
    status: 'read',
    sender: 'Maria Lopez',
    senderId: 't1',
    type: 'voice',
    media: {
      url: '#',
      type: 'voice',
      duration: 15,
    }
  },
  {
    id: '9',
    content: '',
    timestamp: '2023-06-23T09:50:00Z',
    isOutbound: false,
    type: 'image',
    viaWhatsApp: true,
    media: {
      url: '/placeholder.svg',
      type: 'image',
      filename: 'photo.jpg',
    }
  },
  {
    id: '10',
    content: "That looks great! Your appointment is confirmed for Tuesday at 2 PM.",
    timestamp: '2023-06-23T09:53:00Z',
    isOutbound: true,
    status: 'read',
    sender: 'Maria Lopez',
    senderId: 't1',
  },
];

interface ChatContextType {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isSidebarOpen: boolean;
  isTyping: boolean;
  statusFilter: string;
  chatTypeFilter: ChatType | 'all';
  searchTerm: string;
  dateRange?: DateRange;
  assigneeFilter: string;
  tagFilter: string;
  setActiveConversation: (conversation: Conversation) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setStatusFilter: (status: string) => void;
  setChatTypeFilter: (type: ChatType | 'all') => void;
  setSearchTerm: (term: string) => void;
  setDateRange: (range?: DateRange) => void;
  setAssigneeFilter: (assignee: string) => void;
  setTagFilter: (tag: string) => void;
  resetAllFilters: () => void;
  handleSendMessage: (content: string, file: File | null, replyToMessageId?: string) => void;
  handleVoiceMessageSent: (durationInSeconds: number) => void;
  handleReaction: (messageId: string, emoji: string) => void;
  handleReadMessages: () => void;
  pinConversation: (conversationId: string, isPinned: boolean) => void;
  archiveConversation: (conversationId: string, isArchived: boolean) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  storageUsed: number;
  storageLimit: number;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(initialConversations[0]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(initialConversations);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [chatTypeFilter, setChatTypeFilter] = useState<ChatType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const storageUsed = 2.1; // GB
  const storageLimit = 5; // GB

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeConversation) {
      handleReadMessages();
    }
  }, [activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let filtered = [...conversations];
    
    if (chatTypeFilter !== 'all') {
      filtered = filtered.filter(convo => convo.chatType === chatTypeFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(convo => convo.status === statusFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(convo => 
        convo.contact.name.toLowerCase().includes(term) || 
        convo.contact.phone.includes(term) ||
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
    
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      return new Date(b.lastMessage.timestamp).getTime() - 
             new Date(a.lastMessage.timestamp).getTime();
    });
    
    setFilteredConversations(filtered);
  }, [conversations, statusFilter, chatTypeFilter, searchTerm, dateRange, assigneeFilter, tagFilter]);

  const resetAllFilters = () => {
    setStatusFilter('all');
    setChatTypeFilter('all');
    setDateRange(undefined);
    setAssigneeFilter('');
    setTagFilter('');
    setSearchTerm('');
  };

  const handleSendMessage = (content: string, file: File | null, replyToMessageId?: string) => {
    const newMessageId = `new-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    let replyTo;
    if (replyToMessageId) {
      const replyMessage = messages.find(m => m.id === replyToMessageId);
      if (replyMessage) {
        replyTo = {
          id: replyMessage.id,
          content: replyMessage.content,
          sender: replyMessage.sender || 'Unknown',
        };
      }
    }
    
    let newMessage: Message = {
      id: newMessageId,
      content: content.trim(),
      timestamp: timestamp,
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      senderId: 'current-user',
      type: 'text',
      replyTo,
    };
    
    if (file) {
      const fileType = file.type.split('/')[0];
      let mediaType: MessageType = 'document';
      
      if (fileType === 'image') mediaType = 'image';
      else if (fileType === 'video') mediaType = 'video';
      else if (fileType === 'audio') mediaType = 'audio';
      
      newMessage = {
        ...newMessage,
        type: mediaType,
        media: {
          url: URL.createObjectURL(file),
          type: mediaType,
          filename: file.name,
          size: file.size
        }
      };
    }
    
    setIsTyping(false);
    
    setMessages(prev => [...prev, newMessage]);
    
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    });
    
    if (activeConversation) {
      const updatedConvo: Conversation = {
        ...activeConversation,
        lastMessage: {
          content: newMessage.content || (file ? 'Attachment' : 'Message'),
          timestamp: timestamp,
          isOutbound: true,
          isRead: false
        },
        status: activeConversation.status === 'new' ? 'active' : activeConversation.status,
      };
      setActiveConversation(updatedConvo);
      
      setConversations(prev => 
        prev.map(convo => 
          convo.id === activeConversation.id ? updatedConvo : convo
        )
      );
    }
    
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessageId ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);
    
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessageId ? { ...msg, status: 'read' } : msg
        )
      );
    }, 2500);
  };

  const handleVoiceMessageSent = (durationInSeconds: number) => {
    const timestamp = new Date().toISOString();
    const newMessageId = `voice-${Date.now()}`;
    
    const voiceMessage: Message = {
      id: newMessageId,
      content: '',
      timestamp: timestamp,
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      senderId: 'current-user',
      type: 'voice',
      media: {
        url: '#',
        type: 'voice',
        duration: durationInSeconds
      }
    };
    
    setMessages(prev => [...prev, voiceMessage]);
    
    toast({
      title: "Voice message sent",
      description: `Voice message (${durationInSeconds}s) has been sent.`,
    });
    
    if (activeConversation) {
      const updatedConvo = {
        ...activeConversation,
        lastMessage: {
          content: 'Voice message',
          timestamp: timestamp,
          isOutbound: true,
          isRead: false
        }
      };
      setActiveConversation(updatedConvo);
      
      setConversations(prev => 
        prev.map(convo => 
          convo.id === activeConversation.id ? updatedConvo : convo
        )
      );
    }
    
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessageId ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);
    
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessageId ? { ...msg, status: 'read' } : msg
        )
      );
    }, 2500);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => 
      prev.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find(r => r.userId === 'current-user');
          let newReactions = msg.reactions || [];
          
          if (existingReaction) {
            if (existingReaction.emoji === emoji) {
              newReactions = newReactions.filter(r => r.userId !== 'current-user');
            } else {
              newReactions = newReactions.map(r => 
                r.userId === 'current-user' ? { ...r, emoji, timestamp: new Date().toISOString() } : r
              );
            }
          } else {
            newReactions = [...newReactions, {
              emoji,
              userId: 'current-user',
              userName: 'You',
              timestamp: new Date().toISOString()
            }];
          }
          
          return { ...msg, reactions: newReactions };
        }
        return msg;
      })
    );
  };

  const handleReadMessages = () => {
    if (activeConversation) {
      const updatedConvo = {
        ...activeConversation,
        unreadCount: 0,
      };
      
      setActiveConversation(updatedConvo);
      
      setConversations(prev => 
        prev.map(convo => 
          convo.id === activeConversation.id ? updatedConvo : convo
        )
      );
    }
  };

  const pinConversation = (conversationId: string, isPinned: boolean) => {
    setConversations(prev => 
      prev.map(convo => 
        convo.id === conversationId ? { ...convo, isPinned } : convo
      )
    );
    
    if (activeConversation?.id === conversationId) {
      setActiveConversation({ ...activeConversation, isPinned });
    }
    
    toast({
      title: isPinned ? "Conversation pinned" : "Conversation unpinned",
      description: isPinned ? "The conversation has been pinned to the top." : "The conversation has been unpinned.",
    });
  };

  const archiveConversation = (conversationId: string, isArchived: boolean) => {
    setConversations(prev => 
      prev.map(convo => 
        convo.id === conversationId ? { ...convo, isArchived } : convo
      )
    );
    
    if (activeConversation?.id === conversationId) {
      setActiveConversation({ ...activeConversation, isArchived });
    }
    
    toast({
      title: isArchived ? "Conversation archived" : "Conversation unarchived",
      description: isArchived ? "The conversation has been moved to archives." : "The conversation has been restored from archives.",
    });
  };

  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      const shouldShowTyping = Math.random() > 0.7;
      if (shouldShowTyping && activeConversation) {
        setIsTyping(true);
        
        setTimeout(() => {
          setIsTyping(false);
        }, Math.random() * 3000 + 1000);
      }
    }, 8000);
    
    return () => clearTimeout(typingTimeout);
  }, [messages, activeConversation]);

  return (
    <ChatContext.Provider value={{
      conversations,
      filteredConversations,
      activeConversation,
      messages,
      isSidebarOpen,
      isTyping,
      statusFilter,
      chatTypeFilter,
      searchTerm,
      dateRange,
      assigneeFilter,
      tagFilter,
      setActiveConversation,
      setIsSidebarOpen,
      setStatusFilter,
      setChatTypeFilter,
      setSearchTerm,
      setDateRange,
      setAssigneeFilter,
      setTagFilter,
      resetAllFilters,
      handleSendMessage,
      handleVoiceMessageSent,
      handleReaction,
      handleReadMessages,
      pinConversation,
      archiveConversation,
      messagesEndRef,
      storageUsed,
      storageLimit
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
