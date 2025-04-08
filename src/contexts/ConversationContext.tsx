
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Contact, Message, MessageStatus, ChatType } from '@/types/conversation';
import { getLeads } from '@/services/leadService';
import { getClients } from '@/services/clientService';
import { toast } from '@/hooks/use-toast';

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
  contactFilter: ChatType | 'all';
  searchTerm: string;
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
  setContactFilter: (filter: ChatType | 'all') => void;
  setSearchTerm: (term: string) => void;
  addContact: (contact: Contact) => void;
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

  // Load contacts from the API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        
        // Fetch leads
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
        
        // Fetch clients
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

        // Here you would fetch team members and convert them to contacts
        // For now we'll use an empty array
        const teamContacts: Contact[] = [];

        // Combine all contacts
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

    // Only fetch if we don't have contacts already (from initialContacts)
    if (initialContacts.length === 0) {
      fetchContacts();
    }
  }, [initialContacts]);

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

  const addContact = (contact: Contact) => {
    setContacts(prev => [...prev, contact]);
    setFilteredContacts(prev => [...prev, contact]);
    toast({
      title: "Contact added",
      description: `${contact.name} has been added successfully.`,
    });
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
    contactFilter,
    searchTerm,
    messagesEndRef,
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
    addContact
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
