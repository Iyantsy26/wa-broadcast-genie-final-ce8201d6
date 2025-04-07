import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Contact, Message, MessageStatus, ChatType, Conversation } from '@/types/conversation';
import { getLeads } from '@/services/leadService';
import { getClients } from '@/services/clientService';
import { toast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

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
  soundEnabled: boolean;
  disappearingMessages: boolean;
  disappearingTimeout: number;
  cannedResponses: Array<{id: string, title: string, content: string}>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  
  selectContact: (contactId: string) => void;
  toggleSidebar: () => void;
  toggleAssistant: () => void;
  sendMessage: (contactId: string, content: string, deviceId: string) => void;
  sendVoiceMessage: (contactId: string, durationInSeconds: number, deviceId: string) => void;
  setReplyTo: (message: Message | null) => void;
  filterContacts: (
    searchQuery: string,
    type?: ChatType | 'all',
    isOnlineOnly?: boolean,
    isUnreadOnly?: boolean
  ) => void;
  setContactFilter: (filter: ChatType | 'all') => void;
  setSearchTerm: (term: string) => void;
  addContact: (contact: Contact) => void;
  
  sendAttachment: (contactId: string, file: File, type: 'image' | 'video' | 'document', deviceId: string) => void;
  sendLocation: (contactId: string, latitude: number, longitude: number, deviceId: string) => void;
  forwardMessage: (messageId: string, toContactId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  useCannedResponse: (responseId: string, contactId: string) => void;
  
  setWallpaper: (url: string | null) => void;
  toggleSoundEnabled: () => void;
  toggleDisappearingMessages: () => void;
  setDisappearingTimeout: (minutes: number) => void;
  
  toggleContactStar: (contactId: string) => void;
  muteContact: (contactId: string, muted: boolean) => void;
  archiveContact: (contactId: string) => void;
  blockContact: (contactId: string) => void;
  clearChat: (contactId: string) => void;
  deleteMessage: (messageId: string) => void;
  
  requestAIAssistance: (prompt: string) => Promise<string>;
  
  filteredConversations?: Conversation[];
  groupedConversations?: {[name: string]: Conversation[]};
  activeConversation?: Conversation | null;
  chatTypeFilter?: ChatType | 'all';
  dateRange?: DateRange;
  assigneeFilter?: string;
  tagFilter?: string;
  isReplying?: boolean;
  replyToMessage?: Message | null;
  selectedDevice?: string;
  aiAssistantActive?: boolean;
  
  setActiveConversation?: (conversation: Conversation) => void;
  setIsSidebarOpen?: (open: boolean) => void;
  setChatTypeFilter?: (filter: ChatType | 'all') => void;
  setDateRange?: (range: DateRange | undefined) => void;
  setAssigneeFilter?: (assignee: string) => void;
  setTagFilter?: (tag: string) => void;
  resetAllFilters?: () => void;
  handleSendMessage?: (content: string, file: File | null, replyToMessageId?: string) => void;
  handleVoiceMessageSent?: (durationInSeconds: number) => void;
  handleDeleteConversation?: (conversationId: string) => void;
  handleArchiveConversation?: (conversationId: string, isArchived: boolean) => void;
  handleAddTag?: (conversationId: string, tag: string) => void;
  handleAssignConversation?: (conversationId: string, assigneeId: string) => void;
  handleAddReaction?: (messageId: string, emoji: string) => void;
  handleReplyToMessage?: (message: Message) => void;
  handleCancelReply?: () => void;
  handleUseCannedReply?: (replyId: string) => void;
  handleRequestAIAssistance?: () => Promise<string>;
  handleAddContact?: (contact: Contact) => void;
  setSelectedDevice?: (deviceId: string) => void;
  setAiAssistantActive?: (active: boolean) => void;
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
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [disappearingMessages, setDisappearingMessages] = useState<boolean>(false);
  const [disappearingTimeout, setDisappearingTimeout] = useState<number>(5); // minutes
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [cannedResponses] = useState([
    { id: 'canned1', title: 'Greeting', content: 'Hello! How can I help you today?' },
    { id: 'canned2', title: 'Thank You', content: 'Thank you for your message. We appreciate your business.' },
    { id: 'canned3', title: 'Follow Up', content: 'I wanted to follow up on our previous conversation.' },
    { id: 'canned4', title: 'Out of Office', content: 'I am currently out of office and will respond when I return.' }
  ]);

  useEffect(() => {
    if (initialContacts.length === 0) {
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

  const toggleSoundEnabled = () => {
    setSoundEnabled(prev => !prev);
    toast({
      title: soundEnabled ? 'Sound notifications disabled' : 'Sound notifications enabled',
    });
  };

  const toggleDisappearingMessages = () => {
    setDisappearingMessages(prev => !prev);
    toast({
      title: disappearingMessages ? 'Disappearing messages disabled' : 'Disappearing messages enabled',
    });
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
    
    if (replyTo) {
      newMessage.replyTo = {
        id: replyTo.id,
        content: replyTo.content,
        sender: replyTo.sender || '',
        type: replyTo.type,
        status: replyTo.status,
        isOutbound: replyTo.isOutbound,
        timestamp: replyTo.timestamp
      };
      setReplyTo(null);
    }
    
    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMessage]
    }));
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    if (soundEnabled) {
      console.log('Message sent sound played');
    }
    
    if (disappearingMessages) {
      setTimeout(() => {
        setMessages(prev => {
          const updatedMessages = [...prev[contactId]];
          const messageIndex = updatedMessages.findIndex(m => m.id === newMessage.id);
          
          if (messageIndex !== -1) {
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              content: 'This message has expired',
              isExpired: true
            };
          }
          
          return {
            ...prev,
            [contactId]: updatedMessages
          };
        });
      }, disappearingTimeout * 60 * 1000);
    }
    
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

  const sendAttachment = (contactId: string, file: File, type: 'image' | 'video' | 'document', deviceId: string) => {
    const url = URL.createObjectURL(file);
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: '',
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      sender: `You (Device #${deviceId})`,
      type,
      media: {
        url,
        type,
        filename: file.name,
        size: file.size
      }
    };
    
    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMessage]
    }));
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    toast({
      title: 'Attachment sent',
      description: `${type} attachment has been sent.`,
    });
  };

  const sendLocation = (contactId: string, latitude: number, longitude: number, deviceId: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: `Location shared: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      sender: `You (Device #${deviceId})`,
      type: 'location',
      location: { latitude, longitude }
    };
    
    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMessage]
    }));
    
    toast({
      title: 'Location shared',
      description: 'Your current location has been shared.',
    });
  };

  const forwardMessage = (messageId: string, toContactId: string) => {
    let messageToForward: Message | null = null;
    
    for (const contactId in messages) {
      const messageFound = messages[contactId].find(message => message.id === messageId);
      if (messageFound) {
        messageToForward = messageFound;
        break;
      }
    }
    
    if (!messageToForward) {
      toast({
        title: 'Error',
        description: 'Message not found',
        variant: 'destructive',
      });
      return;
    }
    
    const forwardedMessage: Message = {
      ...messageToForward,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sent',
      isForwarded: true
    };
    
    setMessages(prev => ({
      ...prev,
      [toContactId]: [...(prev[toContactId] || []), forwardedMessage]
    }));
    
    toast({
      title: 'Message forwarded',
      description: `Message forwarded to ${contacts.find(c => c.id === toContactId)?.name || 'contact'}`,
    });
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!selectedContactId) return;
    
    setMessages(prev => {
      const updatedMessages = [...prev[selectedContactId]];
      const messageIndex = updatedMessages.findIndex(m => m.id === messageId);
      
      if (messageIndex !== -1) {
        const message = updatedMessages[messageIndex];
        const existingReactions = message.reactions || [];
        
        updatedMessages[messageIndex] = {
          ...message,
          reactions: [
            ...existingReactions,
            {
              emoji,
              userId: 'currentUser',
              userName: 'You',
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      
      return {
        ...prev,
        [selectedContactId]: updatedMessages
      };
    });
  };

  const useCannedResponse = (responseId: string, contactId: string) => {
    const response = cannedResponses.find(r => r.id === responseId);
    
    if (response && contactId) {
      sendMessage(contactId, response.content, '1');
      
      toast({
        title: 'Canned response used',
        description: `"${response.title}" response sent to chat.`,
      });
    }
  };

  const filterContacts = (
    searchQuery: string,
    type: ChatType | 'all' = 'all',
    isOnlineOnly = false,
    isUnreadOnly = false
  ) => {
    let filtered = contacts;
    
    filtered = filtered.filter(contact => !contact.isArchived && !contact.isBlocked);
    
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

  const toggleContactStar = (contactId: string) => {
    setContacts(prev => {
      return prev.map(contact => {
        if (contact.id === contactId) {
          return {
            ...contact,
            isStarred: !contact.isStarred
          };
        }
        return contact;
      });
    });
    
    setFilteredContacts(prev => {
      return prev.map(contact => {
        if (contact.id === contactId) {
          return {
            ...contact,
            isStarred: !contact.isStarred
          };
        }
        return contact;
      });
    });
    
    const isStarred = contacts.find(c => c.id === contactId)?.isStarred;
    toast({
      title: isStarred ? 'Contact unstarred' : 'Contact starred',
      description: `${contacts.find(c => c.id === contactId)?.name || 'Contact'} ${isStarred ? 'removed from' : 'added to'} starred contacts.`,
    });
  };

  const muteContact = (contactId: string, muted: boolean) => {
    setContacts(prev => {
      return prev.map(contact => {
        if (contact.id === contactId) {
          return {
            ...contact,
            isMuted: muted
          };
        }
        return contact;
      });
    });
    
    setFilteredContacts(prev => {
      return prev.map(contact => {
        if (contact.id === contactId) {
          return {
            ...contact,
            isMuted: muted
          };
        }
        return contact;
      });
    });
    
    toast({
      title: muted ? 'Contact muted' : 'Contact unmuted',
      description: `Notifications for ${contacts.find(c => c.id === contactId)?.name || 'contact'} have been ${muted ? 'muted' : 'unmuted'}.`,
    });
  };

  const archiveContact = (contactId: string) => {
    setContacts(prev => {
      return prev.map(contact => {
        if (contact.id === contactId) {
          return {
            ...contact,
            isArchived: true
          };
        }
        return contact;
      });
    });
    
    setFilteredContacts(prev => prev.filter(contact => contact.id !== contactId));
    
    toast({
      title: 'Contact archived',
      description: `${contacts.find(c => c.id === contactId)?.name || 'Contact'} has been archived.`,
    });
  };

  const blockContact = (contactId: string) => {
    setContacts(prev => {
      return prev.map(contact => {
        if (contact.id === contactId) {
          return {
            ...contact,
            isBlocked: true
          };
        }
        return contact;
      });
    });
    
    setFilteredContacts(prev => prev.filter(contact => contact.id !== contactId));
    
    toast({
      title: 'Contact blocked',
      description: `${contacts.find(c => c.id === contactId)?.name || 'Contact'} has been blocked.`,
    });
  };

  const clearChat = (contactId: string) => {
    setMessages(prev => ({
      ...prev,
      [contactId]: []
    }));
    
    toast({
      title: 'Chat cleared',
      description: `Conversation with ${contacts.find(c => c.id === contactId)?.name || 'contact'} has been cleared.`,
    });
  };

  const deleteMessage = (messageId: string) => {
    if (!selectedContactId) return;
    
    setMessages(prev => {
      const contactMessages = prev[selectedContactId] || [];
      const updatedMessages = contactMessages.filter(message => message.id !== messageId);
      
      return {
        ...prev,
        [selectedContactId]: updatedMessages
      };
    });
    
    toast({
      title: 'Message deleted',
      description: 'The message has been deleted.',
    });
  };

  const requestAIAssistance = async (prompt: string): Promise<string> => {
    try {
      setIsAssistantActive(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const responses = [
        `Based on your message "${prompt}", I recommend responding with a professional tone and addressing the specific points mentioned.`,
        `For your message about "${prompt}", you might want to ask for more details before providing a complete answer.`,
        `Regarding "${prompt}", I suggest mentioning your availability and when you can follow up with more information.`
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      toast({
        title: 'AI assistance ready',
        description: 'The AI has generated a suggested response.',
      });
      
      return response;
    } catch (error) {
      console.error('Error getting AI assistance:', error);
      toast({
        title: 'AI assistance failed',
        description: 'Unable to generate a response. Please try again.',
        variant: 'destructive',
      });
      return 'Sorry, I was unable to generate a response. Please try again.';
    }
  };

  const handleArchiveConversation = (conversationId: string, isArchived: boolean) => {
    console.log(`${isArchived ? 'Archiving' : 'Unarchiving'} conversation ${conversationId}`);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
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
    soundEnabled,
    disappearingMessages,
    disappearingTimeout,
    cannedResponses,
    messagesEndRef,
    
    selectContact,
    toggleSidebar,
    toggleAssistant,
    sendMessage,
    sendVoiceMessage,
    setReplyTo,
    filterContacts,
    setContactFilter,
    setSearchTerm,
    addContact,
    
    sendAttachment,
    sendLocation,
    forwardMessage,
    addReaction,
    useCannedResponse,
    
    setWallpaper,
    toggleSoundEnabled,
    toggleDisappearingMessages,
    setDisappearingTimeout,
    
    toggleContactStar,
    muteContact,
    archiveContact,
    blockContact,
    clearChat,
    deleteMessage,
    
    requestAIAssistance,
    
    handleAddReaction,
    handleArchiveConversation,
    handleRequestAIAssistance: async (prompt: string): Promise<string> => {
      return await requestAIAssistance(prompt);
    }
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
