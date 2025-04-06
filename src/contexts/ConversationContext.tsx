
import React, { createContext, useContext, useState, useRef } from 'react';
import { Contact, Message, MessageStatus, ChatType } from '@/types/conversation';

type MessageMap = Record<string, Message[]>;

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
  contactFilter: ChatType | 'all';  // Added this
  searchTerm: string;  // Added this
  messagesEndRef: React.RefObject<HTMLDivElement>;
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
  setContactFilter: (filter: ChatType | 'all') => void;  // Added this
  setSearchTerm: (term: string) => void;  // Added this
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
  const [contactFilter, setContactFilter] = useState<ChatType | 'all'>('all');  // Added this
  const [searchTerm, setSearchTerm] = useState<string>('');  // Added this
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setIsSidebarOpen(false);
    
    // If we don't have messages for this contact yet, initialize an empty array
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
        
        // Scroll to bottom when response is received
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }, 2000); // Time spent "typing"
    }, 1000); // Delay before typing starts
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
    
    // Scroll to bottom when message is sent
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
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by type
    if (type !== 'all') {
      filtered = filtered.filter(contact => contact.type === type);
    }
    
    // Filter by online status
    if (isOnlineOnly) {
      filtered = filtered.filter(contact => contact.isOnline);
    }
    
    // We would filter by unread here if we had that data
    
    setFilteredContacts(filtered);
    setSearchTerm(searchQuery);
    setContactFilter(type);
  };

  const value = {
    contacts,
    filteredContacts,
    selectedContactId,
    messages,
    isTyping,
    replyTo,
    isSidebarOpen,
    isAssistantActive,
    wallpaper,
    contactFilter,  // Added this
    searchTerm,  // Added this
    messagesEndRef,
    selectContact,
    toggleSidebar,
    toggleAssistant,
    sendMessage,
    sendVoiceMessage,
    setReplyTo,
    setWallpaper,
    filterContacts,
    setContactFilter,  // Added this
    setSearchTerm,  // Added this
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
