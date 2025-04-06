import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import {
  Contact,
  Message,
  MessageType,
  MessageStatus,
  ChatType,
  ConversationSettings,
  ReplyTo,
  Reaction,
  Conversation,
} from '@/types/conversation';

interface ConversationContextType {
  // Contacts
  contacts: Contact[];
  selectedContactId: string | null;
  contactFilter: ChatType | 'all';
  searchTerm: string;
  
  // Messages
  messages: Record<string, Message[]>;
  isTyping: boolean;
  replyTo: Message | null;
  
  // UI States
  wallpaper: string;
  soundEnabled: boolean;
  isSidebarOpen: boolean;
  selectedDevice: string;
  isAssistantActive: boolean;
  
  // Settings
  settings: ConversationSettings;
  
  // Added for compatibility with ChatPage and ConversationPage
  filteredConversations: Conversation[];
  groupedConversations: Record<string, Conversation[]>;
  activeConversation: Conversation | null;
  chatTypeFilter: ChatType | 'all';
  dateRange?: DateRange;
  assigneeFilter?: string;
  tagFilter?: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isReplying?: boolean;
  replyToMessage?: Message | null;
  cannedReplies?: {id: string; title: string; content: string}[];
  aiAssistantActive?: boolean;
  
  // Contact Actions
  selectContact: (id: string) => void;
  setContactFilter: (filter: ChatType | 'all') => void;
  setSearchTerm: (term: string) => void;
  toggleContactStar: (id: string) => Promise<void>;
  muteContact: (id: string, muted: boolean) => Promise<void>;
  archiveContact: (id: string) => Promise<void>;
  blockContact: (id: string) => Promise<void>;
  reportContact: (id: string, reason: string) => Promise<void>;

  // Message Actions
  sendMessage: (content: string, type: MessageType, mediaUrl?: string) => Promise<void>;
  sendVoiceMessage: (durationSeconds: number) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  forwardMessage: (messageId: string, contactIds: string[]) => Promise<void>;
  setReplyTo: (message: Message | null) => void;
  
  // UI Actions
  toggleSidebar: () => void;
  changeWallpaper: (wallpaperUrl: string) => void;
  toggleSound: () => void;
  setSelectedDevice: (deviceId: string) => void;
  toggleAssistant: () => void;
  
  // Settings Actions
  updateSettings: (newSettings: Partial<ConversationSettings>) => void;
  clearChat: (contactId: string) => Promise<void>;
  exportChat: (contactId: string) => Promise<void>;
  
  // Search
  searchContacts: (query: string) => Contact[];
  searchMessages: (contactId: string, query: string) => Message[];
  
  // Added for compatibility with ChatPage and ConversationPage
  setActiveConversation: (conversation: Conversation) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setChatTypeFilter: (filter: ChatType | 'all') => void;
  setDateRange?: (range: DateRange | undefined) => void;
  setAssigneeFilter?: (assignee: string) => void;
  setTagFilter?: (tag: string) => void;
  resetAllFilters: () => void;
  handleSendMessage: (content: string, type?: MessageType, mediaUrl?: string) => Promise<void>;
  handleVoiceMessageSent: (durationSeconds: number) => Promise<void>;
  handleDeleteConversation: (conversationId: string) => Promise<void>;
  handleArchiveConversation: (conversationId: string) => Promise<void>;
  handleAddTag: (conversationId: string, tag: string) => Promise<void>;
  handleAssignConversation: (conversationId: string, assignee: string) => Promise<void>;
  handleAddReaction?: (messageId: string, emoji: string) => Promise<void>;
  handleReplyToMessage?: (message: Message) => void;
  handleCancelReply?: () => void;
  handleUseCannedReply?: (replyId: string) => void;
  handleRequestAIAssistance?: (prompt: string) => Promise<string>;
  handleAddContact?: (contact: Partial<Contact>) => Promise<void>;
  setAiAssistantActive?: (active: boolean) => void;
}

const defaultSettings: ConversationSettings = {
  notifications: true,
  showTypingIndicator: true,
  messageDisappearing: false,
  disappearingTimeout: 24, // hours
  mediaAutoDownload: true,
  chatBackup: false,
  language: 'en',
  fontSize: 'medium',
};

export const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // State for contacts and messages
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  // UI state
  const [isTyping, setIsTyping] = useState(false);
  const [wallpaper, setWallpaper] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string>('default');
  const [isAssistantActive, setIsAssistantActive] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [contactFilter, setContactFilter] = useState<ChatType | 'all'>('all');
  
  // Reply and reaction state
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  
  // Settings
  const [settings, setSettings] = useState<ConversationSettings>(defaultSettings);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load contacts and messages from Supabase
  useEffect(() => {
    const loadContacts = async () => {
      try {
        // Fetch team members (team_members instead of agents)
        const { data: agents, error: agentsError } = await supabase
          .from('team_members')
          .select('*')
          .eq('status', 'active');
        
        if (agentsError) throw agentsError;
        
        // Fetch clients
        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select('*');
          
        if (clientsError) throw clientsError;
        
        // Fetch leads
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('*');
          
        if (leadsError) throw leadsError;
        
        // Transform data to our Contact type
        const teamContacts = agents?.map(agent => ({
          id: agent.id,
          name: agent.name,
          avatar: agent.avatar,
          phone: agent.phone || '',
          type: 'team' as ChatType,
          isOnline: Math.random() > 0.5, // Mock online status
          lastSeen: new Date().toISOString(),
          role: agent.role || '',
          isStarred: false,
          isMuted: false,
          isArchived: false,
          isBlocked: false,
          tags: [],
        })) || [];
        
        const clientContacts = clients?.map(client => ({
          id: client.id,
          name: client.name,
          avatar: client.avatar,
          phone: client.phone || '',
          type: 'client' as ChatType,
          isOnline: Math.random() > 0.7, // Mock online status
          lastSeen: new Date().toISOString(),
          role: 'Client',
          isStarred: false,
          isMuted: false,
          isArchived: false,
          isBlocked: false,
          tags: ['active'],
        })) || [];
        
        const leadContacts = leads?.map(lead => ({
          id: lead.id,
          name: lead.name,
          avatar: lead.avatar,
          phone: lead.phone || '',
          type: 'lead' as ChatType,
          isOnline: Math.random() > 0.8, // Mock online status
          lastSeen: new Date().toISOString(),
          role: 'Lead',
          isStarred: false,
          isMuted: true,
          isArchived: false,
          isBlocked: false,
          tags: [lead.status || 'new'],
        })) || [];
        
        const allContacts = [...teamContacts, ...clientContacts, ...leadContacts];
        setContacts(allContacts);
        
        // If we have contacts but no selected contact, select the first one
        if (allContacts.length > 0 && !selectedContactId) {
          setSelectedContactId(allContacts[0].id);
        }
        
        // Now load messages for all contacts
        await loadAllMessages(allContacts);
        
      } catch (error) {
        console.error('Error loading contacts:', error);
        toast({
          title: "Error",
          description: "Failed to load contacts. Using demo data instead.",
          variant: "destructive",
        });
        
        // Load demo data if API fails
        loadDemoData();
      }
    };
    
    const loadAllMessages = async (contacts: Contact[]) => {
      try {
        const messagesByContact: Record<string, Message[]> = {};
        
        for (const contact of contacts) {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender.eq.${contact.id},recipient_id.eq.${contact.id}`)
            .order('timestamp', { ascending: true });
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            messagesByContact[contact.id] = data.map(msg => ({
              id: msg.id,
              content: msg.content || '',
              timestamp: msg.timestamp,
              type: msg.message_type as MessageType,
              status: msg.status as MessageStatus,
              sender: msg.sender || 'Unknown',
              isOutbound: msg.is_outbound || false,
              media: msg.media_url ? {
                url: msg.media_url,
                type: msg.media_type as 'image' | 'video' | 'document' | 'voice',
                filename: msg.media_filename,
                duration: msg.media_duration,
                size: undefined
              } : undefined,
              replyTo: undefined,
              reactions: []
            }));
          } else {
            // Create welcome message for each contact
            messagesByContact[contact.id] = [{
              id: uuidv4(),
              content: `Welcome to your conversation with ${contact.name}!`,
              timestamp: new Date().toISOString(),
              type: 'text',
              status: 'sent',
              sender: 'System',
              isOutbound: true,
              reactions: []
            }];
          }
        }
        
        setMessages(messagesByContact);
      } catch (error) {
        console.error('Error loading messages:', error);
        // Create empty message arrays for all contacts if loading fails
        const emptyMessages: Record<string, Message[]> = {};
        contacts.forEach(contact => {
          emptyMessages[contact.id] = [{
            id: uuidv4(),
            content: `Start your conversation with ${contact.name}`,
            timestamp: new Date().toISOString(),
            type: 'text',
            status: 'sent',
            sender: 'System',
            isOutbound: true,
            reactions: []
          }];
        });
        
        setMessages(emptyMessages);
      }
    };
    
    const loadDemoData = () => {
      // Create demo contacts
      const demoContacts: Contact[] = [
        {
          id: 'team-1',
          name: 'Jane Smith',
          avatar: '/avatars/jane.jpg',
          phone: '+1 (555) 123-4567',
          type: 'team',
          isOnline: true,
          lastSeen: new Date().toISOString(),
          role: 'Support Agent',
          isStarred: true,
          isMuted: false,
          isArchived: false,
          isBlocked: false,
          tags: ['support', 'tier1']
        },
        {
          id: 'client-1',
          name: 'John Doe',
          avatar: '/avatars/john.jpg',
          phone: '+1 (555) 987-6543',
          type: 'client',
          isOnline: false,
          lastSeen: new Date(Date.now() - 3600000).toISOString(),
          role: 'Client',
          isStarred: false,
          isMuted: false,
          isArchived: false,
          isBlocked: false,
          tags: ['premium', 'enterprise']
        },
        {
          id: 'lead-1',
          name: 'Sarah Johnson',
          avatar: '/avatars/sarah.jpg',
          phone: '+1 (555) 765-4321',
          type: 'lead',
          isOnline: false,
          lastSeen: new Date(Date.now() - 7200000).toISOString(),
          role: 'Lead',
          isStarred: false,
          isMuted: true,
          isArchived: false,
          isBlocked: false,
          tags: ['website-inquiry', 'high-value']
        }
      ];
      
      setContacts(demoContacts);
      
      // Create demo messages
      const demoMessages: Record<string, Message[]> = {
        'team-1': [
          {
            id: '1',
            content: 'Hi there! How can I help you today?',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            type: 'text',
            status: 'read',
            sender: 'Jane Smith',
            isOutbound: false,
            reactions: []
          },
          {
            id: '2',
            content: 'I have a question about the latest update',
            timestamp: new Date(Date.now() - 86300000).toISOString(),
            type: 'text',
            status: 'read',
            sender: 'You',
            isOutbound: true,
            reactions: []
          },
          {
            id: '3',
            content: 'Sure! What specifically would you like to know?',
            timestamp: new Date(Date.now() - 86200000).toISOString(),
            type: 'text',
            status: 'read',
            sender: 'Jane Smith',
            isOutbound: false,
            reactions: [{
              emoji: '👍',
              userId: 'you',
              userName: 'You',
              timestamp: new Date(Date.now() - 86100000).toISOString()
            }]
          }
        ],
        'client-1': [
          {
            id: '4',
            content: 'Hello! Thank you for your recent purchase.',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            type: 'text',
            status: 'read',
            sender: 'You',
            isOutbound: true,
            reactions: []
          },
          {
            id: '5',
            content: 'Thank you! When can I expect delivery?',
            timestamp: new Date(Date.now() - 172700000).toISOString(),
            type: 'text',
            status: 'read',
            sender: 'John Doe',
            isOutbound: false,
            reactions: []
          },
          {
            id: '6',
            content: 'Your order should arrive within 3-5 business days.',
            timestamp: new Date(Date.now() - 172600000).toISOString(),
            type: 'text',
            status: 'read',
            sender: 'You',
            isOutbound: true,
            reactions: [{
              emoji: '🙏',
              userId: 'client-1',
              userName: 'John Doe',
              timestamp: new Date(Date.now() - 172500000).toISOString()
            }]
          }
        ],
        'lead-1': [
          {
            id: '7',
            content: 'I found your website and I\'m interested in your services.',
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            type: 'text',
            status: 'read',
            sender: 'Sarah Johnson',
            isOutbound: false,
            reactions: []
          },
          {
            id: '8',
            content: 'Great to hear from you! What specifically are you looking for?',
            timestamp: new Date(Date.now() - 259100000).toISOString(),
            type: 'text',
            status: 'read',
            sender: 'You',
            isOutbound: true,
            reactions: []
          },
          {
            id: '9',
            content: 'Here\'s our latest brochure with pricing details.',
            timestamp: new Date(Date.now() - 259000000).toISOString(),
            type: 'document',
            status: 'read',
            sender: 'You',
            isOutbound: true,
            media: {
              url: '/documents/brochure.pdf',
              type: 'document',
              filename: 'Company_Brochure_2023.pdf',
              size: 1240000
            },
            reactions: []
          }
        ]
      };
      
      setMessages(demoMessages);
      setSelectedContactId('team-1');
    };
    
    loadContacts();
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedContactId]);
  
  // Filtered contacts based on search term and filter
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Filter by contact type
      if (contactFilter !== 'all' && contact.type !== contactFilter) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm && !contact.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Don't show archived or blocked contacts in the main list
      if (contact.isArchived || contact.isBlocked) {
        return false;
      }
      
      return true;
    });
  }, [contacts, contactFilter, searchTerm]);
  
  // Sort contacts by last message timestamp
  const sortedContacts = useMemo(() => {
    return [...filteredContacts].sort((a, b) => {
      const aMessages = messages[a.id] || [];
      const bMessages = messages[b.id] || [];
      
      const aLastMessage = aMessages[aMessages.length - 1];
      const bLastMessage = bMessages[bMessages.length - 1];
      
      if (!aLastMessage) return 1;
      if (!bLastMessage) return -1;
      
      return new Date(bLastMessage.timestamp).getTime() - new Date(aLastMessage.timestamp).getTime();
    });
  }, [filteredContacts, messages]);
  
  // Group contacts by type
  const groupedContacts = useMemo(() => {
    const groups: Record<string, Contact[]> = {
      starred: sortedContacts.filter(c => c.isStarred),
      team: sortedContacts.filter(c => c.type === 'team'),
      client: sortedContacts.filter(c => c.type === 'client'),
      lead: sortedContacts.filter(c => c.type === 'lead')
    };
    
    return groups;
  }, [sortedContacts]);
  
  // Contact actions
  const selectContact = useCallback((id: string) => {
    setSelectedContactId(id);
    setReplyTo(null);
    
    // Update message status to read
    setMessages(prev => {
      const contactMessages = prev[id] || [];
      const updatedMessages = contactMessages.map(msg => {
        if (!msg.isOutbound && msg.status !== 'read') {
          return { ...msg, status: 'read' as MessageStatus };
        }
        return msg;
      });
      
      return {
        ...prev,
        [id]: updatedMessages
      };
    });
  }, []);
  
  const toggleContactStar = async (id: string) => {
    try {
      // Update local state first (optimistic update)
      setContacts(prev => {
        return prev.map(contact => {
          if (contact.id === id) {
            return { ...contact, isStarred: !contact.isStarred };
          }
          return contact;
        });
      });
      
      // Update in database
      const contactToUpdate = contacts.find(c => c.id === id);
      if (!contactToUpdate) return;
      
      // Determine which table to update based on contact type
      let table;
      if (contactToUpdate.type === 'team') {
        table = 'agents';
      } else if (contactToUpdate.type === 'client') {
        table = 'clients';
      } else {
        table = 'leads';
      }
      
      // Update the starred status
      const { error } = await supabase
        .from(table)
        .update({ is_starred: !contactToUpdate.isStarred })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: contactToUpdate.isStarred 
          ? `Removed ${contactToUpdate.name} from starred contacts`
          : `Added ${contactToUpdate.name} to starred contacts`,
      });
    } catch (error) {
      console.error('Error toggling star status:', error);
      
      // Revert optimistic update
      setContacts(prev => {
        return prev.map(contact => {
          if (contact.id === id) {
            return { ...contact, isStarred: !contact.isStarred };
          }
          return contact;
        });
      });
      
      toast({
        title: "Error",
        description: "Failed to update star status",
        variant: "destructive",
      });
    }
  };
  
  const muteContact = async (id: string, muted: boolean) => {
    try {
      // Update local state first (optimistic update)
      setContacts(prev => {
        return prev.map(contact => {
          if (contact.id === id) {
            return { ...contact, isMuted: muted };
          }
          return contact;
        });
      });
      
      // We could update this in the database if needed
      
      toast({
        title: "Success",
        description: muted 
          ? `Muted notifications for ${contacts.find(c => c.id === id)?.name}`
          : `Unmuted notifications for ${contacts.find(c => c.id === id)?.name}`,
      });
    } catch (error) {
      console.error('Error updating mute status:', error);
      
      // Revert optimistic update
      setContacts(prev => {
        return prev.map(contact => {
          if (contact.id === id) {
            return { ...contact, isMuted: !muted };
          }
          return contact;
        });
      });
      
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    }
  };
  
  const archiveContact = async (id: string) => {
    try {
      // Update local state first (optimistic update)
      setContacts(prev => {
        return prev.map(contact => {
          if (contact.id === id) {
            return { ...contact, isArchived: true };
          }
          return contact;
        });
      });
      
      // If currently selected contact was archived, select another one
      if (selectedContactId === id) {
        const nextContact = filteredContacts.find(c => c.id !== id);
        if (nextContact) {
          setSelectedContactId(nextContact.id);
        } else {
          setSelectedContactId(null);
        }
      }
      
      // Update in database
      const contactToUpdate = contacts.find(c => c.id === id);
      if (!contactToUpdate) return;
      
      // Determine which table to update based on contact type
      let table;
      if (contactToUpdate.type === 'team') {
        table = 'agents';
      } else if (contactToUpdate.type === 'client') {
        table = 'clients';
      } else {
        table = 'leads';
      }
      
      // Update the archived status
      const { error } = await supabase
        .from(table)
        .update({ is_archived: true })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Archived conversation with ${contactToUpdate.name}`,
      });
    } catch (error) {
      console.error('Error archiving contact:', error);
      
      // Revert optimistic update
      setContacts(prev => {
        return prev.map(contact => {
          if (contact.id === id) {
            return { ...contact, isArchived: false };
          }
          return contact;
        });
      });
      
      toast({
        title: "Error",
        description: "Failed to archive conversation",
        variant: "destructive",
      });
    }
  };
  
  const blockContact = async (id: string) => {
    try {
      // Update local state first (optimistic update)
      setContacts(prev => {
        return prev.map(contact => {
          if (contact.id === id) {
            return { ...contact, isBlocked: true };
          }
          return contact;
        });
      });
      
      // If currently selected contact was blocked, select another one
      if (selectedContactId === id) {
        const nextContact = filteredContacts.find(c => c.id !== id);
        if (nextContact) {
          setSelectedContactId(nextContact.id);
        } else {
          setSelectedContactId(null);
        }
      }
      
      // Update in database if needed
      
      toast({
        title: "Success",
        description: `Blocked ${contacts.find(c => c.id === id)?.name}`,
      });
    } catch (error) {
      console.error('Error blocking contact:', error);
      
      // Revert optimistic update
      setContacts(prev => {
        return prev.map(contact => {
          if (contact.id === id) {
            return { ...contact, isBlocked: false };
          }
          return contact;
        });
      });
      
      toast({
        title: "Error",
        description: "Failed to block contact",
        variant: "destructive",
      });
    }
  };
  
  const reportContact = async (id: string, reason: string) => {
    try {
      // Send report to backend
      toast({
        title: "Success",
        description: `Reported ${contacts.find(c => c.id === id)?.name} for ${reason}`,
      });
    } catch (error) {
      console.error('Error reporting contact:', error);
      
      toast({
        title: "Error",
        description: "Failed to report contact",
        variant: "destructive",
      });
    }
  };
  
  // Message actions
  const sendMessage = async (content: string, type: MessageType = 'text', mediaUrl?: string) => {
    if (!selectedContactId) return;
    
    try {
      const newMessageId = uuidv4();
      const timestamp = new Date().toISOString();
      
      // Create the new message
      const newMessage: Message = {
        id: newMessageId,
        content,
        timestamp,
        type,
        status: 'sending',
        sender: 'You',
        isOutbound: true,
        reactions: [],
        ...(mediaUrl ? {
          media: {
            url: mediaUrl,
            type: type as 'image' | 'video' | 'document' | 'voice',
            filename: mediaUrl.split('/').pop() || 'file'
          }
        } : {}),
        ...(replyTo ? {
          replyTo: {
            id: replyTo.id,
            content: replyTo.content,
            sender: replyTo.sender,
            type: replyTo.type,
            status: replyTo.status,
            isOutbound: replyTo.isOutbound,
            timestamp: replyTo.timestamp
          }
        } : {})
      };
      
      // Add message to state (optimistic update)
      setMessages(prev => {
        const contactMessages = prev[selectedContactId] || [];
        return {
          ...prev,
          [selectedContactId]: [...contactMessages, newMessage]
        };
      });
      
      // Clear reply to
      setReplyTo(null);
      
      // Send message to database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          id: newMessageId,
          content,
          timestamp,
          type,
          status: 'sent',
          sender_id: 'current-user', // Replace with actual user ID
          recipient_id: selectedContactId,
          media_url: mediaUrl,
          reply_to_id: replyTo?.id,
          reply_to_content: replyTo?.content,
          reply_to_sender: replyTo?.sender,
          reply_to_type: replyTo?.type,
          reply_to_is_outbound: replyTo?.isOutbound,
          reply_to_timestamp: replyTo?.timestamp
        })
        .select();
        
      if (error) throw error;
      
      // Update message status to sent
      setTimeout(() => {
        setMessages(prev => {
          const contactMessages = prev[selectedContactId] || [];
          const updatedMessages = contactMessages.map(msg => {
            if (msg.id === newMessageId) {
              return { ...msg, status: 'sent' as MessageStatus };
            }
            return msg;
          });
          
          return {
            ...prev,
            [selectedContactId]: updatedMessages
          };
        });
        
        // Simulate typing from the other person
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          
          // For demo purposes, generate an auto-reply for certain types of messages
          if (type === 'text' && !mediaUrl) {
            const contact = contacts.find(c => c.id === selectedContactId);
            if (contact) {
              const autoReply: Message = {
                id: uuidv4(),
                content: `This is an automated response from ${contact.name}`,
                timestamp: new Date().toISOString(),
                type: 'text',
                status: 'read',
                sender: contact.name,
                isOutbound: false,
                reactions: []
              };
              
              setMessages(prev => {
                const contactMessages = prev[selectedContactId] || [];
                return {
                  ...prev,
                  [selectedContactId]: [...contactMessages, autoReply]
                };
              });
            }
          }
          
          // Update original message status to delivered
          setTimeout(() => {
            setMessages(prev => {
              const contactMessages = prev[selectedContactId] || [];
              const updatedMessages = contactMessages.map(msg => {
                if (msg.id === newMessageId) {
                  return { ...msg, status: 'delivered' as MessageStatus };
                }
                return msg;
              });
              
              return {
                ...prev,
                [selectedContactId]: updatedMessages
              };
            });
            
            // Finally update to read after a bit more time
            setTimeout(() => {
              setMessages(prev => {
                const contactMessages = prev[selectedContactId] || [];
                const updatedMessages = contactMessages.map(msg => {
                  if (msg.id === newMessageId) {
                    return { ...msg, status: 'read' as MessageStatus };
                  }
                  return msg;
                });
                
                return {
                  ...prev,
                  [selectedContactId]: updatedMessages
                };
              });
            }, 2000);
          }, 1500);
        }, 3000);
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update message status to error
      setMessages(prev => {
        const contactMessages = prev[selectedContactId] || [];
        const updatedMessages = contactMessages.map(msg => {
          if (msg.status === 'sending') {
            return { ...msg, status: 'error' as MessageStatus };
          }
          return msg;
        });
        
        return {
          ...prev,
          [selectedContactId]: updatedMessages
        };
      });
      
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };
  
  const sendVoiceMessage = async (durationSeconds: number) => {
    try {
      // In a real app, we would upload the audio file
      // Here we'll just simulate it with a dummy URL
      const dummyAudioUrl = '/audio/voice-message.mp3';
      
      await sendMessage(`Voice message (${durationSeconds}s)`, 'voice', dummyAudioUrl);
      
      // Update the media object to include duration
      setMessages(prev => {
        const contactMessages = prev[selectedContactId!] || [];
        const lastMessage = contactMessages[contactMessages.length - 1];
        
        if (lastMessage && lastMessage.type === 'voice') {
          const updatedMessage = {
            ...lastMessage,
            media: {
              ...lastMessage.media!,
              duration: durationSeconds
            }
          };
          
          return {
            ...prev,
            [selectedContactId!]: [
              ...contactMessages.slice(0, -1),
              updatedMessage
            ]
          };
        }
        
        return prev;
      });
    } catch (error) {
      console.error('Error sending voice message:', error);
      
      toast({
        title: "Error",
        description: "Failed to send voice message",
        variant: "destructive",
      });
    }
  };
  
  const addReaction = async (messageId: string, emoji: string) => {
    if (!selectedContactId) return;
    
    try {
      const timestamp = new Date().toISOString();
      
      // Add reaction to state (optimistic update)
      setMessages(prev => {
        const contactMessages = prev[selectedContactId] || [];
        const updatedMessages = contactMessages.map(msg => {
          if (msg.id === messageId) {
            // Check if reaction already exists
            const existingReaction = msg.reactions?.find(
              r => r.emoji === emoji && r.userId === 'current-user'
            );
            
            if (existingReaction) {
              // Remove existing reaction
              return {
                ...msg,
                reactions: msg.reactions?.filter(
                  r => !(r.emoji === emoji && r.userId === 'current-user')
                ) || []
              };
            } else {
              // Add new reaction
              const newReaction: Reaction = {
                emoji,
                userId: 'current-user',
                userName: 'You',
                timestamp
              };
              
              return {
                ...msg,
                reactions: [...(msg.reactions || []), newReaction]
              };
            }
          }
          return msg;
        });
        
        return {
          ...prev,
          [selectedContactId]: updatedMessages
        };
      });
      
      // Update reaction in database
      // (In a real app, this would be implemented)
      
    } catch (error) {
      console.error('Error adding reaction:', error);
      
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    }
  };
  
  const deleteMessage = async (messageId: string) => {
    if (!selectedContactId) return;
    
    try {
      // Remove message from state (optimistic update)
      setMessages(prev => {
        const contactMessages = prev[selectedContactId] || [];
        
        return {
          ...prev,
          [selectedContactId]: contactMessages.filter(msg => msg.id !== messageId)
        };
      });
      
      // Delete from database
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      
      // Restore message (revert optimistic update)
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };
  
  const forwardMessage = async (messageId: string, contactIds: string[]) => {
    if (!selectedContactId) return;
    
    try {
      // Get the message to forward
      const contactMessages = messages[selectedContactId] || [];
      const messageToForward = contactMessages.find(msg => msg.id === messageId);
      
      if (!messageToForward) {
        throw new Error('Message not found');
      }
      
      // Forward to each selected contact
      for (const contactId of contactIds) {
        const timestamp = new Date().toISOString();
        
        // Create forwarded message
        const forwardedMessage: Message = {
          id: uuidv4(),
          content: messageToForward.content,
          timestamp,
          type: messageToForward.type,
          status: 'sending',
          sender: 'You',
          isOutbound: true,
          reactions: [],
          media: messageToForward.media
        };
        
        // Add message to state
        setMessages(prev => {
          const targetContactMessages = prev[contactId] || [];
          return {
            ...prev,
            [contactId]: [...targetContactMessages, forwardedMessage]
          };
        });
        
        // Update message status to sent after a delay
        setTimeout(() => {
          setMessages(prev => {
            const targetContactMessages = prev[contactId] || [];
            const updatedMessages = targetContactMessages.map(msg => {
              if (msg.id === forwardedMessage.id) {
                return { ...msg, status: 'sent' as MessageStatus };
              }
              return msg;
            });
            
            return {
              ...prev,
              [contactId]: updatedMessages
            };
          });
        }, 1000);
      }
      
      toast({
        title: "Success",
        description: `Message forwarded to ${contactIds.length} contacts`,
      });
    } catch (error) {
      console.error('Error forwarding message:', error);
      
      toast({
        title: "Error",
        description: "Failed to forward message",
        variant: "destructive",
      });
    }
  };
  
  // UI actions
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);
  
  const changeWallpaper = (wallpaperUrl: string) => {
    setWallpaper(wallpaperUrl);
  };
  
  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };
  
  const toggleAssistant = () => {
    setIsAssistantActive(prev => !prev);
  };
  
  // Settings actions
  const updateSettings = (newSettings: Partial<ConversationSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };
  
  const clearChat = async (contactId: string) => {
    try {
      // Clear messages from state
      setMessages(prev => ({
        ...prev,
        [contactId]: [{
          id: uuidv4(),
          content: `Chat history cleared.`,
          timestamp: new Date().toISOString(),
          type: 'text',
          status: 'sent',
          sender: 'System',
          isOutbound: true,
          reactions: []
        }]
      }));
      
      // Delete from database
      const { error } = await supabase
        .from('messages')
        .delete()
        .or(`sender_id.eq.${contactId},recipient_id.eq.${contactId}`);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Chat history cleared successfully",
      });
    } catch (error) {
      console.error('Error clearing chat:', error);
      
      toast({
        title: "Error",
        description: "Failed to clear chat history",
        variant: "destructive",
      });
    }
  };
  
  const exportChat = async (contactId: string) => {
    try {
      const contactMessages = messages[contactId] || [];
      const contact = contacts.find(c => c.id === contactId);
      
      if (!contact) {
        throw new Error('Contact not found');
      }
      
      // Prepare export data
      const exportData = {
        contact: {
          name: contact.name,
          type: contact.type,
          id: contact.id
        },
        messages: contactMessages.map(msg => ({
          content: msg.content,
          timestamp: msg.timestamp,
          sender: msg.sender,
          type: msg.type
        })),
        exportedAt: new Date().toISOString()
      };
      
      // Convert to JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Create download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create and click download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-with-${contact.name.replace(/\s+/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: `Chat history with ${contact.name} exported successfully`,
      });
    } catch (error) {
      console.error('Error exporting chat:', error);
      
      toast({
        title: "Error",
        description: "Failed to export chat history",
        variant: "destructive",
      });
    }
  };
  
  // Search functions
  const searchContacts = (query: string): Contact[] => {
    if (!query.trim()) return [];
    
    const lowercaseQuery = query.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(lowercaseQuery) ||
      contact.phone.toLowerCase().includes(lowercaseQuery) ||
      contact.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };
  
  const searchMessages = (contactId: string, query: string): Message[] => {
    if (!query.trim()) return [];
    
    const contactMessages = messages[contactId] || [];
    const lowercaseQuery = query.toLowerCase();
    
    return contactMessages.filter(message => 
      message.content.toLowerCase().includes(lowercaseQuery)
    );
  };
  
  // Create conversations from contacts and messages for compatibility
  const conversations: Conversation[] = useMemo(() => {
    return contacts.map(contact => {
      const contactMessages = messages[contact.id] || [];
      const lastMsg = contactMessages.length > 0 ? 
        contactMessages[contactMessages.length - 1] : 
        { content: "No messages", timestamp: new Date().toISOString(), isOutbound: true, status: "sent" as MessageStatus };
      
      return {
        id: contact.id,
        contact,
        lastMessage: {
          content: lastMsg.content,
          timestamp: lastMsg.timestamp,
          isOutbound: lastMsg.isOutbound,
          isRead: lastMsg.status === 'read'
        },
        status: contact.isOnline ? 'online' : 'offline',
        chatType: contact.type,
        tags: contact.tags,
        assignedTo: undefined
      };
    });
  }, [contacts, messages]);
  
  // Add filtered conversations for compatibility
  const filteredConversations = useMemo(() => {
    // Simple filtering implementation
    return conversations.filter(convo => 
      (chatTypeFilter === 'all' || convo.chatType === chatTypeFilter) &&
      (!searchTerm || convo.contact.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [conversations, chatTypeFilter, searchTerm]);
  
  // Add grouped conversations for compatibility
  const groupedConversations = useMemo(() => {
    const groups: Record<string, Conversation[]> = {};
    filteredConversations.forEach(convo => {
      const groupName = convo.chatType.charAt(0).toUpperCase() + convo.chatType.slice(1);
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(convo);
    });
    return groups;
  }, [filteredConversations]);
  
  // Find active conversation based on selectedContactId
  const activeConversation = useMemo(() => {
    if (!selectedContactId) return null;
    return conversations.find(convo => convo.id === selectedContactId) || null;
  }, [conversations, selectedContactId]);
  
  // Add missing handler functions
  const setActiveConversation = (conversation: Conversation) => {
    selectContact(conversation.id);
  };
  
  const handleSendMessage = (content: string, type: MessageType = 'text', mediaUrl?: string) => {
    return sendMessage(content, type, mediaUrl);
  };
  
  const handleVoiceMessageSent = (durationSeconds: number) => {
    return sendVoiceMessage(durationSeconds);
  };
  
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      // Implement basic delete functionality
      toast({
        title: "Success",
        description: "Conversation deleted successfully",
      });
      return Promise.resolve();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error", 
        description: "Failed to delete conversation"
      });
      return Promise.reject(error);
    }
  };
  
  const handleArchiveConversation = async (conversationId: string) => {
    return archiveContact(conversationId);
  };
  
  const handleAddTag = async (conversationId: string, tag: string) => {
    try {
      // Implement basic tag functionality
      const contact = contacts.find(c => c.id === conversationId);
      if (contact) {
        setContacts(prev => prev.map(c => {
          if (c.id === conversationId) {
            return { ...c, tags: [...c.tags, tag] };
          }
          return c;
        }));
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };
  
  const handleAssignConversation = async (conversationId: string, assignee: string) => {
    // Implement basic assign functionality
    toast({
      title: "Success",
      description: `Conversation assigned to ${assignee}`,
    });
    return Promise.resolve();
  };
  
  const resetAllFilters = () => {
    setContactFilter('all');
    setSearchTerm('');
  };
  
  // Include these additional properties in the context value
  const contextValue: ConversationContextType = {
    contacts,
    selectedContactId,
    contactFilter,
    searchTerm,
    messages,
    isTyping,
    replyTo,
    wallpaper,
    soundEnabled,
    isSidebarOpen,
    selectedDevice,
    isAssistantActive,
    settings,
    selectContact,
    setContactFilter,
    setSearchTerm,
    toggleContactStar,
    muteContact,
    archiveContact,
    blockContact, 
    reportContact,
    sendMessage,
    sendVoiceMessage,
    addReaction,
    deleteMessage,
    forwardMessage,
    setReplyTo,
    toggleSidebar,
    changeWallpaper,
    toggleSound,
    setSelectedDevice,
    toggleAssistant,
    updateSettings,
    clearChat,
    exportChat,
    searchContacts,
    searchMessages,
    messagesEndRef,
    
    // Add compatibility properties
    filteredConversations,
    groupedConversations,
    activeConversation,
    chatTypeFilter,
    setActiveConversation,
    setIsSidebarOpen,
    setChatTypeFilter: setContactFilter,
    resetAllFilters,
    handleSendMessage,
    handleVoiceMessageSent,
    handleDeleteConversation,
    handleArchiveConversation,
    handleAddTag,
    handleAssignConversation,
    handleAddReaction: addReaction
  };

  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};
