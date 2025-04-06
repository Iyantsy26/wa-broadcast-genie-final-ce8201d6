
import React, { createContext, useContext, useState } from 'react';
import { Conversation, Message, Contact } from '@/types/conversation';

// Mock conversations data
const mockConversations: Conversation[] = [
  {
    id: '1',
    contact: {
      id: '101',
      name: 'John Smith',
      avatar: '/avatars/john-smith.png',
      phone: '+1 (555) 123-4567',
      type: 'client',
      isOnline: true,
      lastSeen: new Date().toISOString(),
      tags: ['premium', 'active']
    },
    lastMessage: {
      content: 'I need help with my account',
      timestamp: '2023-10-02T14:30:00Z',
      isOutbound: false,
      isRead: true
    },
    status: 'active',
    chatType: 'client',
    tags: ['urgent', 'support'],
    assignedTo: 'Sarah',
    isPinned: false,
    isArchived: false,
    unreadCount: 0
  },
  {
    id: '2',
    contact: {
      id: '102',
      name: 'Jane Doe',
      avatar: '/avatars/jane-doe.png',
      phone: '+1 (555) 987-6543',
      type: 'lead',
      isOnline: false,
      lastSeen: '2023-10-01T18:45:00Z',
      tags: ['new', 'interested']
    },
    lastMessage: {
      content: 'Can you send me pricing information?',
      timestamp: '2023-10-01T18:45:00Z',
      isOutbound: false,
      isRead: false
    },
    status: 'new',
    chatType: 'lead',
    tags: ['sales', 'pricing'],
    unreadCount: 1,
    isPinned: true,
    isArchived: false
  },
  {
    id: '3',
    contact: {
      id: '103',
      name: 'Acme Corporation',
      avatar: '/avatars/acme-corp.png',
      phone: '+1 (555) 333-2222',
      type: 'client',
      isOnline: true,
      lastSeen: new Date().toISOString(),
      tags: ['enterprise', 'active']
    },
    lastMessage: {
      content: 'Thanks for the quick response',
      timestamp: '2023-10-02T10:15:00Z',
      isOutbound: true,
      isRead: true
    },
    status: 'active',
    chatType: 'client',
    assignedTo: 'Mike',
    unreadCount: 0,
    isPinned: false,
    isArchived: false
  },
  {
    id: '4',
    contact: {
      id: '104',
      name: 'Alex Johnson',
      avatar: '/avatars/alex-johnson.png',
      phone: '+1 (555) 777-8888',
      type: 'lead',
      isOnline: false,
      lastSeen: '2023-09-30T09:20:00Z',
      tags: ['referral']
    },
    lastMessage: {
      content: 'I saw your product online and I\'m interested in learning more',
      timestamp: '2023-09-30T09:20:00Z',
      isOutbound: false,
      isRead: true
    },
    status: 'contacted',
    chatType: 'lead',
    tags: ['website-lead'],
    unreadCount: 0,
    isPinned: false,
    isArchived: false
  },
  {
    id: '5',
    contact: {
      id: '105',
      name: 'Global Partners Inc',
      avatar: '/avatars/global-partners.png',
      phone: '+1 (555) 444-5555',
      type: 'client',
      isOnline: false,
      lastSeen: '2023-10-01T15:10:00Z',
      tags: ['enterprise']
    },
    lastMessage: {
      content: 'We need to schedule the quarterly review call',
      timestamp: '2023-10-01T15:10:00Z',
      isOutbound: false,
      isRead: true
    },
    status: 'active',
    chatType: 'client',
    assignedTo: 'Sarah',
    unreadCount: 0,
    isPinned: false,
    isArchived: true
  }
];

// Mock messages data
const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '101',
      content: 'Hello, I need help with my account',
      timestamp: '2023-10-02T14:30:00Z',
      isOutbound: false,
      status: 'read',
      sender: 'John Smith',
      type: 'text'
    },
    {
      id: '102',
      content: 'Hi John, I\'d be happy to help. What seems to be the issue?',
      timestamp: '2023-10-02T14:32:00Z',
      isOutbound: true,
      status: 'read',
      sender: 'You',
      type: 'text'
    },
    {
      id: '103',
      content: 'I can\'t access my dashboard after the recent update',
      timestamp: '2023-10-02T14:35:00Z',
      isOutbound: false,
      status: 'read',
      sender: 'John Smith',
      type: 'text'
    }
  ],
  '2': [
    {
      id: '201',
      content: 'Hi, I\'m interested in your services',
      timestamp: '2023-10-01T18:40:00Z',
      isOutbound: false,
      status: 'read',
      sender: 'Jane Doe',
      type: 'text'
    },
    {
      id: '202',
      content: 'Can you send me pricing information?',
      timestamp: '2023-10-01T18:45:00Z',
      isOutbound: false,
      status: 'delivered',
      sender: 'Jane Doe',
      type: 'text'
    }
  ]
};

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  setActiveConversation: (conversation: Conversation) => void;
  sendMessage: (content: string, file: File | null, replyToMessageId?: string) => Promise<void>;
  sendVoiceMessage: (durationInSeconds: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  const getMessagesForConversation = (conversationId: string): Message[] => {
    return mockMessages[conversationId] || [];
  };

  const sendMessage = async (content: string, file: File | null, replyToMessageId?: string): Promise<void> => {
    if (!activeConversation) return;
    
    // Implementation for sending a message
    console.log(`Sending message to ${activeConversation.contact.name}: ${content}`);
    
    // Here we would normally make an API call to send the message
    // For now, just update local state
    const newMessage: Message = {
      id: `new-${Date.now()}`,
      content,
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      type: file ? 
        (file.type.startsWith('image/') ? 'image' : 
         file.type.startsWith('video/') ? 'video' : 'document') : 'text',
      media: file ? {
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'document',
        filename: file.name,
        size: file.size
      } : undefined,
      replyTo: replyToMessageId ? {
        id: replyToMessageId,
        content: 'Previous message',
        sender: 'Someone',
        type: 'text',
        status: 'read',
        isOutbound: false,
        timestamp: new Date().toISOString()
      } : undefined
    };
    
    // Update messages
    mockMessages[activeConversation.id] = [
      ...(mockMessages[activeConversation.id] || []),
      newMessage
    ];
    
    // Update conversation last message
    const updatedConversation: Conversation = {
      ...activeConversation,
      lastMessage: {
        content: content || 'Attachment',
        timestamp: new Date().toISOString(),
        isOutbound: true,
        isRead: false
      }
    };
    
    setActiveConversation(updatedConversation);
    setConversations(prev => 
      prev.map(c => c.id === updatedConversation.id ? updatedConversation : c)
    );
  };

  const sendVoiceMessage = (durationInSeconds: number): void => {
    if (!activeConversation) return;
    
    console.log(`Sending voice message (${durationInSeconds}s) to ${activeConversation.contact.name}`);
    
    // Mock implementation
    const newMessage: Message = {
      id: `voice-${Date.now()}`,
      content: '',
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      type: 'voice',
      media: {
        url: '#',
        type: 'voice',
        duration: durationInSeconds
      }
    };
    
    // Update messages
    mockMessages[activeConversation.id] = [
      ...(mockMessages[activeConversation.id] || []),
      newMessage
    ];
    
    // Update conversation last message
    const updatedConversation = {
      ...activeConversation,
      lastMessage: {
        content: 'Voice message',
        timestamp: new Date().toISOString(),
        isOutbound: true,
        isRead: false
      }
    };
    
    setActiveConversation(updatedConversation);
    setConversations(prev => 
      prev.map(c => c.id === updatedConversation.id ? updatedConversation : c)
    );
  };

  const value: ChatContextType = {
    conversations,
    activeConversation,
    messages: activeConversation ? getMessagesForConversation(activeConversation.id) : [],
    setActiveConversation,
    sendMessage,
    sendVoiceMessage
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
