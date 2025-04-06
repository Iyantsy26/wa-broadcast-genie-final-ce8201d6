import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { Contact, Conversation, Message, MessageType, ChatType } from '@/types/conversation';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface ChatContextType {
  conversations: Conversation[];
  activeChat: Conversation | null;
  chatMessages: Message[];
  isSidebarOpen: boolean;
  isContactModalOpen: boolean;
  isGroupChatModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isProfileModalOpen: boolean;
  isSearchOpen: boolean;
  searchTerm: string;
  chatType: ChatType;
  setSearchTerm: (term: string) => void;
  setChatType: (type: ChatType) => void;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setActiveChat: (chat: Conversation | null) => void;
  setChatMessages: (messages: Message[]) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setIsContactModalOpen: (isOpen: boolean) => void;
  setIsGroupChatModalOpen: (isOpen: boolean) => void;
  setIsSettingsModalOpen: (isOpen: boolean) => void;
  setIsProfileModalOpen: (isOpen: boolean) => void;
  setIsSearchOpen: (isOpen: boolean) => void;
  sendMessage: (content: string, type?: MessageType) => void;
  sendImageMessage: (imageUrl: string, caption?: string) => void;
  sendDocumentMessage: (documentUrl: string, filename: string) => void;
  sendVoiceMessage: (audioUrl: string, durationSeconds: number) => void;
  startNewConversation: (contact: Contact, initialMessage?: string) => void;
  archiveChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  pinChat: (chatId: string) => void;
  muteChat: (chatId: string) => void;
  addContact: (contact: Contact) => void;
  removeContact: (contactId: string) => void;
  createGroupChat: (name: string, participants: Contact[], avatar?: string) => void;
  leaveGroupChat: (chatId: string) => void;
  sendTemplateMock: (templateId: string, leadId: string) => void;
  handleFileUpload: (file: File) => void;
  addReactionToMessage: (messageId: string, emoji: string) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = React.useState<Conversation[]>([
    {
      id: '1',
      contact: {
        id: '1',
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?img=5',
        phone: '+1 (555) 123-4567',
        type: 'client',
        isOnline: true,
        lastSeen: 'Online'
      },
      lastMessage: {
        content: 'Hey there! How can I help you today?',
        timestamp: new Date().toISOString(),
        isOutbound: false,
        isRead: true
      },
      status: 'active',
      chatType: 'client',
      isPinned: true,
      isArchived: false,
      unreadCount: 0,
      tags: ['vip', 'urgent'],
      assignedTo: 'Jane'
    },
    {
      id: '2',
      contact: {
        id: '2',
        name: 'Alice Smith',
        avatar: 'https://i.pravatar.cc/150?img=7',
        phone: '+1 (555) 987-6543',
        type: 'lead',
        isOnline: false,
        lastSeen: '5 minutes ago'
      },
      lastMessage: {
        content: 'I\'m interested in your services. Can we schedule a call?',
        timestamp: new Date().toISOString(),
        isOutbound: false,
        isRead: false
      },
      status: 'new',
      chatType: 'lead',
      isPinned: false,
      isArchived: false,
      unreadCount: 2,
      tags: ['high-priority'],
      assignedTo: 'Mike'
    },
    {
      id: '3',
      contact: {
        id: '3',
        name: 'Bob Johnson',
        avatar: 'https://i.pravatar.cc/150?img=11',
        phone: '+1 (555) 246-1357',
        type: 'client',
        isOnline: true,
        lastSeen: 'Online'
      },
      lastMessage: {
        content: 'Just confirming our meeting for tomorrow.',
        timestamp: new Date().toISOString(),
        isOutbound: true,
        isRead: true
      },
      status: 'active',
      chatType: 'client',
      isPinned: false,
      isArchived: false,
      unreadCount: 0,
      tags: [],
      assignedTo: 'Jane'
    },
    {
      id: '4',
      contact: {
        id: '4',
        name: 'Eva Williams',
        avatar: 'https://i.pravatar.cc/150?img=12',
        phone: '+1 (555) 369-8024',
        type: 'lead',
        isOnline: false,
        lastSeen: '30 minutes ago'
      },
      lastMessage: {
        content: 'Could you send me more details about the product?',
        timestamp: new Date().toISOString(),
        isOutbound: false,
        isRead: true
      },
      status: 'pending',
      chatType: 'lead',
      isPinned: false,
      isArchived: false,
      unreadCount: 1,
      tags: ['follow-up'],
      assignedTo: 'Mike'
    },
    {
      id: '5',
      contact: {
        id: '5',
        name: 'Charlie Brown',
        avatar: 'https://i.pravatar.cc/150?img=10',
        phone: '+1 (555) 159-7531',
        type: 'client',
        isOnline: false,
        lastSeen: '1 hour ago'
      },
      lastMessage: {
        content: 'Everything is working great, thanks!',
        timestamp: new Date().toISOString(),
        isOutbound: true,
        isRead: true
      },
      status: 'resolved',
      chatType: 'client',
      isPinned: false,
      isArchived: true,
      unreadCount: 0,
      tags: [],
      assignedTo: 'Jane'
    },
  ]);

  const [activeChat, setActiveChat] = React.useState<Conversation | null>(conversations[0] || null);
  const [chatMessages, setChatMessages] = React.useState<Message[]>([
    {
      id: '1',
      content: 'Hey there! How can I help you today?',
      timestamp: new Date().toISOString(),
      isOutbound: false,
      status: 'delivered',
      sender: 'John',
      type: 'text',
      viaWhatsApp: true
    },
    {
      id: '2',
      content: 'I\'m interested in your services. Can we schedule a call?',
      timestamp: new Date().toISOString(),
      isOutbound: false,
      status: 'delivered',
      sender: 'John',
      type: 'text',
      viaWhatsApp: true
    },
    {
      id: '3',
      content: 'Just confirming our meeting for tomorrow.',
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      type: 'text',
      viaWhatsApp: true
    },
    {
      id: '4',
      content: 'Could you send me more details about the product?',
      timestamp: new Date().toISOString(),
      isOutbound: false,
      status: 'delivered',
      sender: 'John',
      type: 'text',
      viaWhatsApp: true
    },
    {
      id: '5',
      content: 'Everything is working great, thanks!',
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      type: 'text',
      viaWhatsApp: true
    },
  ]);

  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = React.useState<boolean>(false);
  const [isGroupChatModalOpen, setIsGroupChatModalOpen] = React.useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState<boolean>(false);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [chatType, setChatType] = React.useState<ChatType>('client');
  const { toast } = useToast();

  const mockChats: Conversation[] = [
    {
      id: '1',
      contact: {
        id: 'contact1',
        name: 'John Smith',
        avatar: '/avatars/john-smith.jpg',
        phone: '+1234567890',
        type: 'client',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        tags: []
      },
      lastMessage: {
        content: 'Hello, I need some help with my account',
        timestamp: new Date().toISOString(),
        isOutbound: false,
        isRead: true
      },
      unreadCount: 0,
      isTyping: false,
      chatType: 'client',
    },
    {
      id: '2',
      contact: {
        id: 'contact2',
        name: 'Sarah Johnson',
        avatar: '/avatars/sarah-johnson.jpg',
        phone: '+9876543210',
        type: 'lead',
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000).toISOString(),
        tags: []
      },
      lastMessage: {
        content: 'Can you tell me more about your services?',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        isOutbound: false,
        isRead: false
      },
      unreadCount: 2,
      isTyping: false,
      chatType: 'lead',
    },
    {
      id: '3',
      contact: {
        id: 'contact3',
        name: 'Robert Brown',
        avatar: '/avatars/robert-brown.jpg',
        phone: '+1122334455',
        type: 'client',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        tags: []
      },
      lastMessage: {
        content: 'Thanks for your quick response!',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        isOutbound: true,
        isRead: true
      },
      unreadCount: 0,
      isTyping: false,
      chatType: 'client',
    },
    {
      id: '4',
      contact: {
        id: 'contact4',
        name: 'Emma Wilson',
        avatar: '/avatars/emma-wilson.jpg',
        phone: '+2233445566',
        type: 'lead',
        isOnline: false,
        lastSeen: new Date(Date.now() - 86400000).toISOString(),
        tags: []
      },
      lastMessage: {
        content: 'I would like to schedule a demo',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        isOutbound: false,
        isRead: true
      },
      unreadCount: 0,
      isTyping: false,
      chatType: 'lead',
    },
    {
      id: '5',
      contact: {
        id: 'contact5',
        name: 'David Miller',
        avatar: '/avatars/david-miller.jpg',
        phone: '+3344556677',
        type: 'client',
        isOnline: false,
        lastSeen: new Date(Date.now() - 172800000).toISOString(),
        tags: []
      },
      lastMessage: {
        content: 'Invoice received, thank you',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        isOutbound: true,
        isRead: true
      },
      unreadCount: 0,
      isTyping: false,
      chatType: 'client',
    },
  ];

  const handleNewMessage = (chatId: string, message: Message) => {
    setConversations(prev => 
      prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            lastMessage: {
              content: message.content,
              timestamp: message.timestamp,
              isOutbound: message.isOutbound,
              isRead: false
            },
            unreadCount: !message.isOutbound ? (chat.unreadCount || 0) + 1 : chat.unreadCount,
          };
        }
        return chat;
      })
    );
  };

  const sendMessage = (content: string, type: MessageType = 'text') => {
    if (!activeChat) return;

    const newMessage: Message = {
      id: uuidv4(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      type,
      viaWhatsApp: true
    };

    setChatMessages((prev) => [...prev, newMessage]);
    
    setConversations((prev) =>
      prev.map((convo) =>
        convo.id === activeChat.id
          ? {
              ...convo,
              lastMessage: {
                content: content.trim(),
                timestamp: new Date().toISOString(),
                isOutbound: true,
                isRead: false
              }
            }
          : convo
      )
    );

    setTimeout(() => {
      const response: Message = {
        id: uuidv4(),
        content: `Response to: ${content}`,
        timestamp: new Date().toISOString(),
        isOutbound: false,
        status: 'delivered',
        sender: 'John',
        type: 'text'
      };

      setChatMessages((prev) => [...prev, response]);
    }, 1000);
  };

  const sendImageMessage = (imageUrl: string, caption: string = '') => {
    if (!activeChat) return;

    const newMessage: Message = {
      id: uuidv4(),
      content: caption,
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      type: 'image',
      media: {
        url: imageUrl,
        type: 'image',
      },
      viaWhatsApp: true
    };

    setChatMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      const response: Message = {
        id: uuidv4(),
        content: 'Thanks for the image!',
        timestamp: new Date().toISOString(),
        isOutbound: false,
        status: 'delivered',
        sender: 'John',
        type: 'text'
      };

      setChatMessages((prev) => [...prev, response]);
    }, 1500);
  };

  const sendDocumentMessage = (documentUrl: string, filename: string) => {
    if (!activeChat) return;

    const newMessage: Message = {
      id: uuidv4(),
      content: '',
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      type: 'document',
      media: {
        url: documentUrl,
        type: 'document',
        filename: filename
      },
      viaWhatsApp: true
    };

    setChatMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      const response: Message = {
        id: uuidv4(),
        content: 'I received your document!',
        timestamp: new Date().toISOString(),
        isOutbound: false,
        status: 'delivered',
        sender: 'John',
        type: 'text'
      };

      setChatMessages((prev) => [...prev, response]);
    }, 1500);
  };

  const sendVoiceMessage = (audioUrl: string, durationSeconds: number) => {
    if (!activeChat) return;

    const newMessage: Message = {
      id: uuidv4(),
      content: '',
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      type: 'voice',
      media: {
        url: audioUrl,
        type: 'voice',
        duration: durationSeconds
      },
      viaWhatsApp: true
    };

    setChatMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      const response: Message = {
        id: uuidv4(),
        content: 'I listened to your voice message!',
        timestamp: new Date().toISOString(),
        isOutbound: false,
        status: 'delivered',
        sender: 'John',
        type: 'text'
      };

      setChatMessages((prev) => [...prev, response]);
    }, 2000);
  };

  const startNewConversation = (contact: Contact, initialMessage?: string) => {
    const newConversation: Conversation = {
      id: uuidv4(),
      contact: contact,
      lastMessage: {
        content: initialMessage || 'New conversation started',
        timestamp: new Date().toISOString(),
        isOutbound: true,
        isRead: false
      },
      status: 'new',
      chatType: contact.type === 'client' ? 'client' : 'lead',
      isPinned: false,
      isArchived: false,
      unreadCount: 0
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveChat(newConversation);
    setChatMessages([]);

    if (initialMessage) {
      sendMessage(initialMessage);
    }
  };

  const archiveChat = (chatId: string) => {
    setConversations((prev) =>
      prev.map((convo) =>
        convo.id === chatId ? { ...convo, isArchived: true } : convo
      )
    );

    if (activeChat?.id === chatId) {
      setActiveChat(null);
      setChatMessages([]);
    }
  };

  const deleteChat = (chatId: string) => {
    setConversations((prev) => prev.filter((convo) => convo.id !== chatId));

    if (activeChat?.id === chatId) {
      setActiveChat(null);
      setChatMessages([]);
    }
  };

  const pinChat = (chatId: string) => {
    setConversations((prev) =>
      prev.map((convo) =>
        convo.id === chatId ? { ...convo, isPinned: !convo.isPinned } : convo
      )
    );
  };

  const muteChat = (chatId: string) => {
    toast({
      title: "Mute Chat",
      description: "Chat muted successfully.",
    });
  };

  const addContact = (contact: Contact) => {
    toast({
      title: "Add Contact",
      description: `${contact.name} added to contacts.`,
    });
  };

  const removeContact = (contactId: string) => {
    toast({
      title: "Remove Contact",
      description: "Contact removed successfully.",
    });
  };

  const createGroupChat = (name: string, participants: Contact[], avatar?: string) => {
    const newGroupChat: Conversation = {
      id: uuidv4(),
      contact: {
        id: uuidv4(),
        name: name,
        avatar: avatar || 'https://i.pravatar.cc/150?img=50',
        type: 'team'
      },
      lastMessage: {
        content: 'Group chat created',
        timestamp: new Date().toISOString(),
        isOutbound: true,
        isRead: false
      },
      status: 'active',
      chatType: 'team',
      isPinned: false,
      isArchived: false,
      unreadCount: 0
    };

    setConversations((prev) => [newGroupChat, ...prev]);
    setActiveChat(newGroupChat);
    setChatMessages([]);

    toast({
      title: "Group Chat Created",
      description: `${name} group chat created successfully.`,
    });
  };

  const leaveGroupChat = (chatId: string) => {
    toast({
      title: "Leave Group Chat",
      description: "You have left the group chat.",
    });
  };

  const sendTemplateMock = (templateId: string, leadId: string) => {
    const templateText = `Hi [Lead Name], thanks for your interest in our product! Here's a special offer just for you.`;

    const mockTemplateMessage: Message = {
      id: uuidv4(),
      content: templateText,
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      type: 'text'
    };

    setChatMessages((prev) => [...prev, mockTemplateMessage]);

    setTimeout(() => {
      const response: Message = {
        id: uuidv4(),
        content: 'Great offer, thanks!',
        timestamp: new Date().toISOString(),
        isOutbound: false,
        status: 'delivered',
        sender: 'John',
        type: 'text'
      };

      setChatMessages((prev) => [...prev, response]);
    }, 1500);
  };

  const handleFileUpload = (file: File) => {
    const fileType = file.type.split('/')[0];

    if (!['image', 'voice', 'video'].includes(fileType) && file.type !== 'application/pdf') {
      toast({
        title: "Error",
        description: "Unsupported file type.",
        variant: "destructive",
      });
      return;
    }

    if (fileType === 'image') {
      const imageMessage: Message = {
        id: uuidv4(),
        content: '',
        timestamp: new Date().toISOString(),
        isOutbound: true,
        status: 'sending',
        sender: 'You',
        type: 'image',
        media: {
          url: URL.createObjectURL(file),
          type: 'image',
          filename: file.name,
          size: file.size
        }
      };

      setChatMessages((prev) => [...prev, imageMessage]);

      setTimeout(() => {
        const response: Message = {
          id: uuidv4(),
          content: 'Nice image!',
          timestamp: new Date().toISOString(),
          isOutbound: false,
          status: 'delivered',
          sender: 'John',
          type: 'text'
        };

        setChatMessages((prev) => [...prev, response]);
      }, 1500);
    } else if (fileType === 'voice' || fileType === 'video') {
      const mediaType: 'voice' | 'video' = fileType === 'voice' ? 'voice' : 'video';
      const mediaMessage: Message = {
        id: uuidv4(),
        content: '',
        timestamp: new Date().toISOString(),
        isOutbound: true,
        status: 'sending',
        sender: 'You',
        type: mediaType,
        media: {
          url: URL.createObjectURL(file),
          type: mediaType,
          filename: file.name,
          size: file.size
        }
      };

      setChatMessages((prev) => [...prev, mediaMessage]);

      setTimeout(() => {
        const response: Message = {
          id: uuidv4(),
          content: `Received your ${fileType}!`,
          timestamp: new Date().toISOString(),
          isOutbound: false,
          status: 'delivered',
          sender: 'John',
          type: 'text'
        };

        setChatMessages((prev) => [...prev, response]);
      }, 2000);
    } else {
      const documentMessage: Message = {
        id: uuidv4(),
        content: '',
        timestamp: new Date().toISOString(),
        isOutbound: true,
        status: 'sending',
        sender: 'You',
        type: 'document',
        media: {
          url: URL.createObjectURL(file),
          type: 'document',
          filename: file.name,
          size: file.size
        }
      };

      setChatMessages((prev) => [...prev, documentMessage]);

      setTimeout(() => {
        const response: Message = {
          id: uuidv4(),
          content: 'Received your document!',
          timestamp: new Date().toISOString(),
          isOutbound: false,
          status: 'delivered',
          sender: 'John',
          type: 'text'
        };

        setChatMessages((prev) => [...prev, response]);
      }, 2000);
    }
  };

  const addReactionToMessage = (messageId: string, emoji: string) => {
    setChatMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? {
              ...message,
              reactions: [
                ...(message.reactions || []),
                {
                  emoji: emoji,
                  userId: 'user-1',
                  userName: 'You',
                  timestamp: new Date().toISOString()
                }
              ]
            }
          : message
      )
    );
  };

  const handleAddContact = () => {
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      name: 'New Team Member',
      avatar: '/avatars/default.png',
      type: 'team',
      tags: []
    };

    const newConversation: Conversation = {
      id: `chat-${Date.now()}`,
      contact: newContact,
      lastMessage: {
        content: 'New team member added',
        timestamp: new Date().toISOString(),
        isOutbound: true,
        isRead: false
      },
      unreadCount: 0,
      chatType: 'team',
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveChat(newConversation);
    setChatMessages([]);

    toast({
      title: "Add Team Member",
      description: "New team member added successfully.",
    });
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      activeChat,
      chatMessages,
      isSidebarOpen,
      isContactModalOpen,
      isGroupChatModalOpen,
      isSettingsModalOpen,
      isProfileModalOpen,
      isSearchOpen,
      searchTerm,
      chatType,
      setSearchTerm,
      setChatType,
      setConversations,
      setActiveChat,
      setChatMessages,
      setIsSidebarOpen,
      setIsContactModalOpen,
      setIsGroupChatModalOpen,
      setIsSettingsModalOpen,
      setIsProfileModalOpen,
      setIsSearchOpen,
      sendMessage,
      sendImageMessage,
      sendDocumentMessage,
      sendVoiceMessage,
      startNewConversation,
      archiveChat,
      deleteChat,
      pinChat,
      muteChat,
      addContact,
      removeContact,
      createGroupChat,
      leaveGroupChat,
      sendTemplateMock,
      handleFileUpload,
      addReactionToMessage,
      handleNewMessage,
      handleAddContact
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
