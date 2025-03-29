import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, parseISO } from 'date-fns';
import { Conversation, Message, ChatType, Contact, MessageType } from '@/types/conversation';
import { toast } from "@/hooks/use-toast";

// Sample data - normally this would come from an API
const initialConversations: Conversation[] = [
  {
    id: '1',
    contact: {
      id: 'c1',
      name: 'Sarah Johnson',
      phone: '+1 555-123-4567',
      avatar: '',
      isOnline: true,
      type: 'client'
    },
    lastMessage: {
      content: "Yes, I'd like to book an appointment for next week.",
      timestamp: '2023-06-23T10:23:00Z',
      isOutbound: false,
      isRead: true,
    },
    assignedTo: 'Maria Lopez',
    tags: ['appointment', 'new-customer'],
    status: 'active',
    chatType: 'client'
  },
  {
    id: '2',
    contact: {
      id: 'c2',
      name: 'David Williams',
      phone: '+1 555-987-6543',
      avatar: '',
      type: 'client'
    },
    lastMessage: {
      content: "Thanks for the information. I'll check it and get back to you.",
      timestamp: '2023-06-23T09:45:00Z',
      isOutbound: true,
      isRead: true,
    },
    status: 'waiting',
    chatType: 'client'
  },
  {
    id: '3',
    contact: {
      id: 'l1',
      name: 'Michael Brown',
      phone: '+1 555-567-8901',
      avatar: '',
      type: 'lead'
    },
    lastMessage: {
      content: 'I have a question about my recent order #45678.',
      timestamp: '2023-06-23T08:30:00Z',
      isOutbound: false,
      isRead: false,
    },
    status: 'new',
    chatType: 'lead'
  },
  {
    id: '4',
    contact: {
      id: 'c3',
      name: 'Emily Davis',
      phone: '+1 555-345-6789',
      avatar: '',
      isOnline: true,
      type: 'client'
    },
    lastMessage: {
      content: 'Your appointment has been confirmed for June 25th at 2 PM.',
      timestamp: '2023-06-22T16:15:00Z',
      isOutbound: true,
      isRead: true,
    },
    assignedTo: 'Robert Chen',
    tags: ['appointment', 'follow-up'],
    status: 'resolved',
    chatType: 'client'
  },
  {
    id: '5',
    contact: {
      id: 'c4',
      name: 'James Wilson',
      phone: '+1 555-234-5678',
      avatar: '',
      type: 'client'
    },
    lastMessage: {
      content: 'Do you have this product in blue?',
      timestamp: '2023-06-22T14:50:00Z',
      isOutbound: false,
      isRead: true,
    },
    assignedTo: 'Maria Lopez',
    tags: ['product-inquiry'],
    status: 'active',
    chatType: 'client'
  },
];

const initialMessages: Message[] = [
  {
    id: '1',
    content: "Hello! I'm interested in your services.",
    timestamp: '2023-06-23T09:30:00Z',
    isOutbound: false,
  },
  {
    id: '2',
    content: 'Thanks for reaching out! How can we help you today?',
    timestamp: '2023-06-23T09:32:00Z',
    isOutbound: true,
    status: 'read',
    sender: 'Maria Lopez'
  },
  {
    id: '3',
    content: "I'd like to book an appointment for a consultation.",
    timestamp: '2023-06-23T09:35:00Z',
    isOutbound: false,
  },
  {
    id: '4',
    content: 'Sure, we have availability next week. What day works best for you?',
    timestamp: '2023-06-23T09:38:00Z',
    isOutbound: true,
    status: 'read',
    sender: 'Maria Lopez'
  },
  {
    id: '5',
    content: "I'd prefer Tuesday afternoon if possible.",
    timestamp: '2023-06-23T09:40:00Z',
    isOutbound: false,
  },
  {
    id: '6',
    content: 'Great! We have an opening at 2 PM or 4 PM on Tuesday. Which would you prefer?',
    timestamp: '2023-06-23T09:42:00Z',
    isOutbound: true,
    status: 'read',
    sender: 'Maria Lopez'
  },
  {
    id: '7',
    content: '2 PM works perfectly for me.',
    timestamp: '2023-06-23T09:45:00Z',
    isOutbound: false,
  },
  {
    id: '8',
    content: "Excellent! I've reserved Tuesday at 2 PM for your consultation. Could you please provide your name and contact information?",
    timestamp: '2023-06-23T09:47:00Z',
    isOutbound: true,
    status: 'read',
    sender: 'Maria Lopez'
  },
  {
    id: '9',
    content: 'My name is Sarah Johnson, and my phone number is +1 555-123-4567.',
    timestamp: '2023-06-23T09:50:00Z',
    isOutbound: false,
  },
  {
    id: '10',
    content: "Thank you, Sarah! Your appointment is confirmed for Tuesday at 2 PM. We'll send you a reminder the day before. Is there anything specific you'd like to discuss during the consultation?",
    timestamp: '2023-06-23T09:53:00Z',
    isOutbound: true,
    status: 'read',
    sender: 'Maria Lopez'
  },
  {
    id: '11',
    content: "Yes, I'd like to discuss your premium service options and pricing.",
    timestamp: '2023-06-23T10:00:00Z',
    isOutbound: false,
  },
  {
    id: '12',
    content: "Perfect! We'll make sure to prepare information about our premium services for your consultation. If you have any questions before Tuesday, feel free to reach out.",
    timestamp: '2023-06-23T10:05:00Z',
    isOutbound: true,
    status: 'read',
    sender: 'Maria Lopez'
  },
  {
    id: '13',
    content: 'Great, thank you! Looking forward to it.',
    timestamp: '2023-06-23T10:08:00Z',
    isOutbound: false,
  },
  {
    id: '14',
    content: "You're welcome, Sarah! We're looking forward to meeting you on Tuesday. Have a great rest of your day!",
    timestamp: '2023-06-23T10:10:00Z',
    isOutbound: true,
    status: 'read',
    sender: 'Maria Lopez'
  },
  {
    id: '15',
    content: "Yes, I'd like to book an appointment for next week.",
    timestamp: '2023-06-23T10:23:00Z',
    isOutbound: false,
  },
  {
    id: '16',
    content: 'Here is a photo of the location',
    timestamp: '2023-06-23T10:25:00Z',
    isOutbound: true,
    status: 'read',
    sender: 'Maria Lopez',
    type: 'image',
    media: {
      url: '/placeholder.svg',
      type: 'image',
      filename: 'location.jpg'
    }
  },
  {
    id: '17',
    content: '',
    timestamp: '2023-06-23T10:27:00Z',
    isOutbound: false,
    type: 'voice',
    media: {
      url: '#',
      type: 'voice',
      duration: 12
    }
  },
];

interface ConversationContextType {
  conversations: Conversation[];
  filteredConversations: Conversation[];
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
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(initialConversations[0]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(initialConversations);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let filtered = [...conversations];
    
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
    
    setFilteredConversations(filtered);
  }, [conversations, statusFilter, searchTerm, dateRange, assigneeFilter, tagFilter]);

  const resetAllFilters = () => {
    setStatusFilter('all');
    setDateRange(undefined);
    setAssigneeFilter('');
    setTagFilter('');
    setSearchTerm('');
  };

  const handleSendMessage = (content: string, file: File | null) => {
    const newMessageId = `new-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    let newMessage: Message = {
      id: newMessageId,
      content: content.trim(),
      timestamp: timestamp,
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      type: 'text'
    };
    
    if (file) {
      const fileType = file.type.split('/')[0];
      let mediaType: 'image' | 'video' | 'document' | null = null;
      
      if (fileType === 'image') mediaType = 'image';
      else if (fileType === 'video') mediaType = 'video';
      else mediaType = 'document';
      
      newMessage = {
        ...newMessage,
        type: mediaType,
        media: {
          url: URL.createObjectURL(file),
          type: mediaType,
          filename: file.name
        }
      };
    }
    
    setMessages(prev => [...prev, newMessage]);
    
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    });
    
    if (activeConversation) {
      const updatedConvo = {
        ...activeConversation,
        lastMessage: {
          content: newMessage.content || 'Attachment',
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
  };

  return (
    <ConversationContext.Provider value={{
      conversations,
      filteredConversations,
      activeConversation,
      messages,
      isSidebarOpen,
      statusFilter,
      searchTerm,
      dateRange,
      assigneeFilter,
      tagFilter,
      setActiveConversation,
      setIsSidebarOpen,
      setStatusFilter,
      setSearchTerm,
      setDateRange,
      setAssigneeFilter,
      setTagFilter,
      resetAllFilters,
      handleSendMessage,
      handleVoiceMessageSent,
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
