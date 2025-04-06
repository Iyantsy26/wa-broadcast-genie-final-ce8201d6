
import React, { createContext, useContext, useState, useRef } from 'react';
import { Contact, Message, MessageStatus, ChatType, Conversation } from '@/types/conversation';

type MessageMap = Record<string, Message[]>;

interface ChatContextType {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  messages: MessageMap;
  activeConversation: Conversation | null;
  isTyping: boolean;
  isSidebarOpen: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  setActiveConversation: (conversation: Conversation) => void;
  toggleSidebar: () => void;
  sendMessage: (conversationId: string, content: string) => void;
  sendVoiceMessage: (conversationId: string, durationInSeconds: number) => void;
  filterConversations: (
    searchQuery: string,
    type?: ChatType | 'all',
    dateRange?: [Date | null, Date | null],
    assigneeId?: string | null,
    tags?: string[]
  ) => void;
}

interface ChatProviderProps {
  children: React.ReactNode;
}

// Mock data - in a real app, this would come from an API
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    phone: '+1 (555) 123-4567',
    type: 'client',
    isOnline: true,
    lastSeen: '2023-06-18T15:42:07.322Z',
    tags: ['Active', 'Premium']
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    phone: '+1 (555) 987-6543',
    type: 'lead',
    isOnline: false,
    lastSeen: '2023-06-17T09:24:15.322Z',
    tags: ['New', 'Interested']
  },
  {
    id: '3',
    name: 'Michael Brown',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    phone: '+1 (555) 234-5678',
    type: 'client',
    isOnline: true,
    lastSeen: '2023-06-18T14:50:00.322Z',
    tags: ['Active', 'Enterprise']
  },
  {
    id: '4',
    name: 'Emily Davis',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    phone: '+1 (555) 876-5432',
    type: 'lead',
    isOnline: false,
    lastSeen: '2023-06-16T18:30:45.322Z',
    tags: ['New', 'Cold']
  },
  {
    id: '5',
    name: 'David Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
    phone: '+1 (555) 345-6789',
    type: 'client',
    isOnline: false,
    lastSeen: '2023-06-17T21:15:30.322Z',
    tags: ['Inactive', 'Basic']
  }
];

const mockConversations: Conversation[] = [
  {
    id: '1',
    contact: mockContacts[0],
    lastMessage: {
      content: 'I need to reschedule our appointment',
      timestamp: '2023-06-18T15:42:07.322Z',
      isOutbound: false,
      isRead: true
    },
    chatType: 'client'
  },
  {
    id: '2',
    contact: mockContacts[1],
    lastMessage: {
      content: 'Thank you for the information',
      timestamp: '2023-06-17T09:24:15.322Z',
      isOutbound: true,
      isRead: false
    },
    chatType: 'lead'
  },
  {
    id: '3',
    contact: mockContacts[2],
    lastMessage: {
      content: 'Yes, we can definitely help with that',
      timestamp: '2023-06-18T14:50:00.322Z',
      isOutbound: true,
      isRead: true
    },
    chatType: 'client'
  },
  {
    id: '4',
    contact: mockContacts[3],
    lastMessage: {
      content: 'I saw your product online and I have some questions',
      timestamp: '2023-06-16T18:30:45.322Z',
      isOutbound: false,
      isRead: true
    },
    chatType: 'lead'
  },
  {
    id: '5',
    contact: mockContacts[4],
    lastMessage: {
      content: 'When is my subscription renewal date?',
      timestamp: '2023-06-17T21:15:30.322Z',
      isOutbound: false,
      isRead: false
    },
    chatType: 'client'
  }
];

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageMap>({
    '1': [
      {
        id: '101',
        content: 'Hello John, how can I help you today?',
        timestamp: '2023-06-18T15:30:00.000Z',
        isOutbound: true,
        status: 'read',
        sender: 'Me',
        type: 'text'
      },
      {
        id: '102',
        content: 'I need to reschedule our appointment for next week',
        timestamp: '2023-06-18T15:32:00.000Z',
        isOutbound: false,
        status: 'read',
        sender: 'John Smith',
        type: 'text'
      },
      {
        id: '103',
        content: 'Sure, what day works best for you?',
        timestamp: '2023-06-18T15:33:30.000Z',
        isOutbound: true,
        status: 'read',
        sender: 'Me',
        type: 'text'
      },
      {
        id: '104',
        content: 'Would Tuesday at 2pm work?',
        timestamp: '2023-06-18T15:35:00.000Z',
        isOutbound: false,
        status: 'read',
        sender: 'John Smith',
        type: 'text'
      },
      {
        id: '105',
        content: 'Yes, that works for me. I\'ve updated our calendar.',
        timestamp: '2023-06-18T15:36:30.000Z',
        isOutbound: true,
        status: 'read',
        sender: 'Me',
        type: 'text'
      },
      {
        id: '106',
        content: 'Great, thank you!',
        timestamp: '2023-06-18T15:38:00.000Z',
        isOutbound: false,
        status: 'read',
        sender: 'John Smith',
        type: 'text'
      }
    ],
    '2': [
      {
        id: '201',
        content: 'Hi Sarah, I noticed you were interested in our premium plan',
        timestamp: '2023-06-17T09:10:00.000Z',
        isOutbound: true,
        status: 'read',
        sender: 'Me',
        type: 'text'
      },
      {
        id: '202',
        content: 'Yes, I was looking at the features and pricing',
        timestamp: '2023-06-17T09:12:00.000Z',
        isOutbound: false,
        status: 'read',
        sender: 'Sarah Johnson',
        type: 'text'
      },
      {
        id: '203',
        content: 'Would you like me to send you some more detailed information?',
        timestamp: '2023-06-17T09:13:30.000Z',
        isOutbound: true,
        status: 'read',
        sender: 'Me',
        type: 'text'
      },
      {
        id: '204',
        content: 'That would be great, thank you',
        timestamp: '2023-06-17T09:15:00.000Z',
        isOutbound: false,
        status: 'read',
        sender: 'Sarah Johnson',
        type: 'text'
      },
      {
        id: '205',
        content: 'I\'ve sent the info to your email. Let me know if you have any questions!',
        timestamp: '2023-06-17T09:18:00.000Z',
        isOutbound: true,
        status: 'read',
        sender: 'Me',
        type: 'text'
      },
      {
        id: '206',
        content: 'Thank you for the information',
        timestamp: '2023-06-17T09:24:15.322Z',
        isOutbound: false,
        status: 'delivered',
        sender: 'Sarah Johnson',
        type: 'text'
      }
    ]
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const sendMessage = (conversationId: string, content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      sender: 'Me',
      type: 'text'
    };
    
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));
    
    // Update last message in conversation
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? {
              ...conv,
              lastMessage: {
                content,
                timestamp: new Date().toISOString(),
                isOutbound: true,
                isRead: false
              }
            }
          : conv
      )
    );
    
    setFilteredConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? {
              ...conv,
              lastMessage: {
                content,
                timestamp: new Date().toISOString(),
                isOutbound: true,
                isRead: false
              }
            }
          : conv
      )
    );
    
    // Update active conversation if it's the one we're sending to
    if (activeConversation?.id === conversationId) {
      setActiveConversation({
        ...activeConversation,
        lastMessage: {
          content,
          timestamp: new Date().toISOString(),
          isOutbound: true,
          isRead: false
        }
      });
    }
    
    // Scroll to bottom when message is sent
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    // Simulate typing response after sending a message
    setTimeout(() => {
      setIsTyping(true);
      
      // After typing for a while, send a response
      setTimeout(() => {
        setIsTyping(false);
        
        const responseMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          content: `This is an automatic response to "${content}"`,
          timestamp: new Date().toISOString(),
          isOutbound: false,
          status: 'delivered',
          sender: conversations.find(c => c.id === conversationId)?.contact.name || 'Unknown',
          type: 'text'
        };
        
        setMessages(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), responseMessage]
        }));
        
        // Scroll to bottom when response is received
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }, 2000); // Time spent "typing"
    }, 1000); // Delay before typing starts
  };

  const sendVoiceMessage = (conversationId: string, durationInSeconds: number) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: `Voice message (${durationInSeconds} seconds)`,
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      sender: 'Me',
      type: 'voice',
      media: {
        url: '#',
        type: 'voice',
        duration: durationInSeconds
      }
    };
    
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));
    
    // Update last message in conversation
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? {
              ...conv,
              lastMessage: {
                content: 'Voice message',
                timestamp: new Date().toISOString(),
                isOutbound: true,
                isRead: false
              }
            }
          : conv
      )
    );
    
    setFilteredConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? {
              ...conv,
              lastMessage: {
                content: 'Voice message',
                timestamp: new Date().toISOString(),
                isOutbound: true,
                isRead: false
              }
            }
          : conv
      )
    );
    
    // Scroll to bottom when message is sent
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const filterConversations = (
    searchQuery: string,
    type: ChatType | 'all' = 'all',
    dateRange?: [Date | null, Date | null],
    assigneeId?: string | null,
    tags?: string[]
  ) => {
    let filtered = conversations;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(conv =>
        conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by type
    if (type !== 'all') {
      filtered = filtered.filter(conv => conv.chatType === type);
    }
    
    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0];
      const endDate = dateRange[1];
      
      filtered = filtered.filter(conv => {
        const msgDate = new Date(conv.lastMessage.timestamp);
        return msgDate >= startDate && msgDate <= endDate;
      });
    }
    
    // Filter by tags (if we had tags in the data model)
    if (tags && tags.length > 0) {
      filtered = filtered.filter(conv => {
        return tags.some(tag => conv.contact.tags.includes(tag));
      });
    }
    
    // In a real app, we'd filter by assignee here
    
    setFilteredConversations(filtered);
  };

  const value = {
    conversations,
    filteredConversations,
    messages,
    activeConversation,
    isTyping,
    isSidebarOpen,
    messagesEndRef,
    setActiveConversation,
    toggleSidebar,
    sendMessage,
    sendVoiceMessage,
    filterConversations,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
