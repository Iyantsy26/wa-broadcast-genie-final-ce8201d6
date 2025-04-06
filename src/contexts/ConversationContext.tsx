import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { 
  Conversation, 
  Contact, 
  Message, 
  ChatType, 
  MessageType, 
  MessageStatus,
  LastMessage
} from '@/types/conversation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getConversations, getMessages, sendMessage } from '@/services/conversationService';
import { useConversationFilters } from '@/hooks/conversations/useConversationFilters';
import { useConversationActions } from '@/hooks/conversations/useConversationActions';
import { DateRange } from 'react-day-picker';

interface MessageFromDB {
  content: string;
  conversation_id: string;
  id: string;
  is_outbound: boolean;
  media_duration: number;
  media_filename: string;
  media_type: string;
  media_url: string;
  message_type: string;
  sender: string;
  status: string;
  timestamp: string;
  reply_to_id?: string;
  reply_to_content?: string;
  reply_to_sender?: string;
  reply_to_type?: string;
  reply_to_is_outbound?: boolean;
  reply_to_timestamp?: string;
}

interface ConversationContextType {
  contacts: Contact[];
  messages: Record<string, Message[]>;
  selectedContactId: string | null;
  loading: boolean;
  isTyping: boolean;
  isSidebarOpen: boolean;
  wallpaper: string | null;
  replyTo: Message | null;
  contactFilter: ChatType | 'all';
  searchTerm: string;
  selectedDevice: string;
  
  chatTypeFilter: ChatType | 'all';
  dateRange?: DateRange;
  assigneeFilter: string;
  tagFilter: string;
  
  filteredConversations: Conversation[];
  groupedConversations: { [key: string]: Conversation[] };
  activeConversation: Conversation | null;
  
  selectContact: (contactId: string) => void;
  toggleSidebar: () => void;
  setWallpaper: (url: string | null) => void;
  setReplyTo: (message: Message | null) => void;
  sendMessage: (contactId: string, content: string) => void;
  sendVoiceMessage: (contactId: string, durationInSeconds: number) => void;
  setContactFilter: (filter: ChatType | 'all') => void;
  setSearchTerm: (term: string) => void;
  toggleContactStar: (contactId: string) => void;
  muteContact: (contactId: string, mute: boolean) => void;
  archiveContact: (contactId: string, archive: boolean) => void;
  blockContact: (contactId: string, block: boolean) => void;
  reportContact: (contactId: string) => void;
  clearChat: (contactId: string) => void;
  setSelectedDevice: (deviceId: string) => void;
  
  setChatTypeFilter: (filter: ChatType | 'all') => void;
  setDateRange: (range: DateRange | undefined) => void;
  setAssigneeFilter: (assignee: string) => void;
  setTagFilter: (tag: string) => void;
  resetAllFilters: () => void;
  
  handleSendMessage: (content: string, file: File | null, replyToMessageId?: string) => Promise<void>;
  handleVoiceMessageSent: (durationInSeconds: number) => Promise<void>;
  handleDeleteConversation: (conversationId: string) => Promise<void>;
  handleArchiveConversation: (conversationId: string, isArchived?: boolean) => Promise<void>;
  handleAddTag: (conversationId: string, tag: string) => Promise<void>;
  handleAssignConversation: (conversationId: string, assignee: string) => Promise<void>;
  
  messagesEndRef: React.RefObject<HTMLDivElement>;
  
  isReplying: boolean;
  replyToMessage: Message | null;
  cannedReplies: { id: string; title: string; content: string }[];
  aiAssistantActive: boolean;
  isAssistantActive: boolean;
  setAiAssistantActive: (active: boolean) => void;
  handleAddReaction: (messageId: string, emoji: string) => void;
  handleReplyToMessage: (message: Message) => void;
  handleCancelReply: () => void;
  handleUseCannedReply: (replyContent: string) => void;
  handleRequestAIAssistance: (prompt: string) => Promise<string>;
  handleAddContact: (contactData: Partial<Contact>) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  deleteMessage: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  toggleAssistant: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

const useConversationState = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [contactFilter, setContactFilter] = useState<ChatType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDevice, setSelectedDevice] = useState<string>("1"); // Default to first device
  const [aiAssistantActive, setAiAssistantActive] = useState<boolean>(false);
  const [isAssistantActive, setIsAssistantActive] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  return {
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    loading,
    setLoading,
    isSidebarOpen,
    setIsSidebarOpen,
    contacts,
    setContacts,
    messages,
    setMessages,
    selectedContactId,
    setSelectedContactId,
    isTyping,
    setIsTyping,
    wallpaper,
    setWallpaper,
    replyTo,
    setReplyTo,
    contactFilter,
    setContactFilter,
    searchTerm,
    setSearchTerm,
    selectedDevice,
    setSelectedDevice,
    aiAssistantActive,
    setAiAssistantActive,
    isAssistantActive,
    setIsAssistantActive,
    messagesEndRef
  };
};

interface ConversationProviderProps {
  children: ReactNode;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({ children }) => {
  const {
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    loading,
    setLoading,
    isSidebarOpen,
    setIsSidebarOpen,
    contacts,
    setContacts,
    messages,
    setMessages,
    selectedContactId,
    setSelectedContactId,
    isTyping,
    setIsTyping,
    wallpaper,
    setWallpaper,
    replyTo,
    setReplyTo,
    contactFilter,
    setContactFilter,
    searchTerm,
    setSearchTerm,
    selectedDevice,
    setSelectedDevice,
    aiAssistantActive,
    setAiAssistantActive,
    isAssistantActive,
    setIsAssistantActive,
    messagesEndRef
  } = useConversationState();

  const {
    filteredConversations,
    groupedConversations,
    chatTypeFilter,
    dateRange,
    assigneeFilter,
    tagFilter,
    setChatTypeFilter,
    setDateRange,
    setAssigneeFilter,
    setTagFilter,
    resetAllFilters
  } = useConversationFilters(conversations);
  
  const activeMessages = selectedContactId && messages[selectedContactId] ? messages[selectedContactId] : [];

  const cannedReplies = [
    { id: '1', title: 'Greeting', content: 'Hello! How can I help you today?' },
    { id: '2', title: 'Thank You', content: 'Thank you for reaching out. We appreciate your interest!' },
    { id: '3', title: 'Follow Up', content: "Just following up on our conversation. Do you have any questions I can help with?" },
  ];
  
  useEffect(() => {
    loadContacts();
  }, []);
  
  useEffect(() => {
    if (selectedContactId) {
      const conversation = conversations.find(c => c.contact.id === selectedContactId);
      if (conversation && !messages[selectedContactId]) {
        loadMessages(selectedContactId);
      }
    }
  }, [selectedContactId, conversations]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedContactId]);
  
  const loadContacts = async () => {
    setLoading(true);
    try {
      const fetchedConversations = await getConversations();
      
      if (fetchedConversations.length > 0) {
        const uniqueContacts = fetchedConversations.map(conv => ({
          ...conv.contact,
          tags: conv.contact.tags || []
        }));
        
        setContacts(uniqueContacts);
        setConversations(fetchedConversations);
        
        if (!selectedContactId && fetchedConversations.length > 0) {
          setSelectedContactId(fetchedConversations[0].contact.id);
          
          await loadAllMessages();
        }
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast({
        title: "Error loading contacts",
        description: "Please refresh the page or try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAllMessages = async () => {
    try {
      const allMessages: Record<string, Message[]> = {};
      
      for (const conversation of conversations) {
        const contactId = conversation.contact.id;
        const { data: messageData, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('timestamp', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        if (messageData) {
          const transformedMessages: Message[] = messageData.map(msg => {
            const message: Message = {
              id: msg.id,
              content: msg.content,
              timestamp: msg.timestamp,
              isOutbound: msg.is_outbound,
              status: msg.status as MessageStatus,
              sender: msg.sender,
              type: msg.message_type as MessageType,
              media: msg.media_url ? {
                url: msg.media_url,
                type: (msg.media_type as 'image' | 'video' | 'document' | 'voice'),
                filename: msg.media_filename,
                duration: msg.media_duration,
              } : undefined,
              reactions: []
            };
            
            const msgWithReply = msg as MessageFromDB;
            if (msgWithReply.reply_to_id) {
              message.replyTo = {
                id: msgWithReply.reply_to_id,
                content: msgWithReply.reply_to_content || "Original message",
                sender: msgWithReply.reply_to_sender || "Sender",
                type: (msgWithReply.reply_to_type as MessageType) || "text",
                status: "sent",
                isOutbound: msgWithReply.reply_to_is_outbound || false,
                timestamp: msgWithReply.reply_to_timestamp || msg.timestamp
              };
            }
            
            return message;
          });
          
          allMessages[contactId] = transformedMessages;
        }
      }
      
      setMessages(allMessages);
      
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };
  
  const loadMessages = async (contactId: string) => {
    try {
      const conversation = conversations.find(c => c.contact.id === contactId);
      
      if (!conversation) {
        throw new Error(`No conversation found for contact ${contactId}`);
      }
      
      const conversationMessages = await getMessages(conversation.id);
      
      setMessages(prev => ({
        ...prev,
        [contactId]: conversationMessages
      }));
      
    } catch (error) {
      console.error(`Error loading messages for contact ${contactId}:`, error);
      toast({
        title: "Error loading messages",
        description: "Please refresh the page or try again later",
        variant: "destructive",
      });
    }
  };
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const selectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setIsSidebarOpen(false);
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  const toggleAssistant = () => {
    setIsAssistantActive(prev => !prev);
  };
  
  const sendMessageHandler = async (contactId: string, content: string) => {
    if (!content.trim()) return;
    
    const conversation = conversations.find(c => c.contact.id === contactId);
    
    if (!conversation) {
      console.error("No conversation found for contact", contactId);
      return;
    }
    
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sending',
      sender: 'You',
      type: 'text'
    };
    
    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), tempMessage]
    }));
    
    scrollToBottom();
    
    try {
      const sentMessage = await sendMessage(
        conversation.id,
        content,
        'text',
        'You'
      );
      
      setMessages(prev => ({
        ...prev,
        [contactId]: prev[contactId].map(msg => 
          msg.id === tempMessage.id ? sentMessage : msg
        )
      }));
      
      const newLastMessage: LastMessage = {
        content,
        timestamp: new Date().toISOString(),
        isOutbound: true,
        isRead: false
      };

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id 
            ? { 
                ...conv, 
                lastMessage: newLastMessage
              }
            : conv
        )
      );
      
      setReplyTo(null);
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      setMessages(prev => ({
        ...prev,
        [contactId]: prev[contactId].map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'error' as MessageStatus } 
            : msg
        )
      }));
      
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };
  
  const sendVoiceMessage = async (contactId: string, durationInSeconds: number) => {
    const conversation = conversations.find(c => c.contact.id === contactId);
    
    if (!conversation) {
      console.error("No conversation found for contact", contactId);
      return;
    }
    
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: 'Voice message',
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sending',
      sender: 'You',
      type: 'voice',
      media: {
        url: 'placeholder-url',
        type: 'voice',
        duration: durationInSeconds,
      }
    };
    
    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), tempMessage]
    }));
    
    scrollToBottom();
    
    try {
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [contactId]: prev[contactId].map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, status: 'delivered' as MessageStatus } 
              : msg
          )
        }));
        
        const newLastMessage: LastMessage = {
          content: 'Voice message',
          timestamp: new Date().toISOString(),
          isOutbound: true,
          isRead: false
        };

        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversation.id 
              ? { 
                  ...conv, 
                  lastMessage: newLastMessage
                }
              : conv
          )
        );
      }, 1500);
      
    } catch (error) {
      console.error("Error sending voice message:", error);
      
      setMessages(prev => ({
        ...prev,
        [contactId]: prev[contactId].map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'error' as MessageStatus } 
            : msg
        )
      }));
      
      toast({
        title: "Failed to send voice message",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };
  
  const toggleContactStar = (contactId: string) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, isStarred: !contact.isStarred } 
          : contact
      )
    );
  };
  
  const muteContact = (contactId: string, mute: boolean) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, isMuted: mute } 
          : contact
      )
    );
    
    toast({
      title: mute ? "Contact muted" : "Contact unmuted",
      description: `Notifications ${mute ? 'disabled' : 'enabled'} for this contact`,
    });
  };
  
  const archiveContact = (contactId: string, archive: boolean) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, isArchived: archive } 
          : contact
      )
    );
    
    toast({
      title: archive ? "Conversation archived" : "Conversation unarchived",
      description: `Conversation has been ${archive ? 'moved to archive' : 'restored'}`,
    });
  };
  
  const blockContact = (contactId: string, block: boolean) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, isBlocked: block } 
          : contact
      )
    );
    
    toast({
      title: block ? "Contact blocked" : "Contact unblocked",
      description: block 
        ? "You will no longer receive messages from this contact" 
        : "You can now receive messages from this contact",
      variant: block ? "destructive" : "default",
    });
  };
  
  const reportContact = (contactId: string) => {
    toast({
      title: "Contact reported",
      description: "Thank you for your report. We will review it shortly.",
    });
  };
  
  const clearChat = (contactId: string) => {
    setMessages(prev => ({
      ...prev,
      [contactId]: []
    }));
    
    toast({
      title: "Chat cleared",
      description: "All messages have been removed from this conversation",
    });
  };
  
  const {
    handleDeleteConversation,
    handleArchiveConversation,
    handleAddTag,
    handleAssignConversation
  } = useConversationActions(
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    setIsSidebarOpen
  );
  
  const addReaction = (messageId: string, emoji: string) => {
    if (!selectedContactId) return;
    
    setMessages(prev => {
      const contactMessages = [...prev[selectedContactId]];
      const messageIndex = contactMessages.findIndex(m => m.id === messageId);
      
      if (messageIndex !== -1) {
        const message = contactMessages[messageIndex];
        const reactions = message.reactions || [];
        
        const existingReaction = reactions.findIndex(r => r.userId === 'current-user' && r.emoji === emoji);
        
        if (existingReaction !== -1) {
          reactions.splice(existingReaction, 1);
        } else {
          reactions.push({
            emoji,
            userId: 'current-user',
            userName: 'You',
            timestamp: new Date().toISOString()
          });
        }
        
        contactMessages[messageIndex] = {
          ...message,
          reactions
        };
      }
      
      return {
        ...prev,
        [selectedContactId]: contactMessages
      };
    });
  };
  
  const deleteMessage = (messageId: string) => {
    if (!selectedContactId) return;
    
    setMessages(prev => {
      const contactMessages = prev[selectedContactId].filter(m => m.id !== messageId);
      return {
        ...prev,
        [selectedContactId]: contactMessages
      };
    });
    
    toast({
      title: "Message deleted",
      description: "The message has been removed from this conversation",
    });
  };
  
  const handleReplyToMessage = (message: Message) => {
    setReplyTo(message);
  };
  
  const handleCancelReply = () => {
    setReplyTo(null);
  };
  
  const handleUseCannedReply = (replyContent: string) => {
    if (selectedContactId) {
      sendMessageHandler(selectedContactId, replyContent);
    }
  };
  
  const handleRequestAIAssistance = async (prompt: string): Promise<string> => {
    toast({
      title: "AI Assistant",
      description: "Generating response...",
    });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const aiResponse = `Here's a suggestion in response to "${prompt}": Thank you for your inquiry. I'd be happy to help you with that. Could you please provide more details so I can assist you better?`;
        
        toast({
          title: "AI Suggestion Ready",
          description: "AI has generated a response for you",
        });
        
        resolve(aiResponse);
      }, 1500);
    });
  };
  
  const handleAddContact = (contactData: Partial<Contact>) => {
    const newContact: Contact = {
      id: `new-${Date.now()}`,
      name: contactData.name || 'New Contact',
      avatar: contactData.avatar,
      phone: contactData.phone || '',
      type: contactData.type || 'lead',
      isOnline: false,
      tags: contactData.tags || [],
    };
    
    setContacts(prev => [...prev, newContact]);
    
    const newLastMessage: LastMessage = {
      content: 'New conversation',
      timestamp: new Date().toISOString(),
      isOutbound: true,
      isRead: true
    };

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      contact: newContact,
      lastMessage: newLastMessage,
      chatType: newContact.type,
      tags: [],
    };
    
    setConversations(prev => [...prev, newConversation]);
    
    setSelectedContactId(newContact.id);
    
    toast({
      title: "Contact added",
      description: `${newContact.name} has been added to your contacts`,
    });
  };
  
  const handleSendMessage = async (content: string, file: File | null, replyToMessageId?: string): Promise<void> => {
    if (!selectedContactId) return;
    
    await sendMessageHandler(selectedContactId, content);
  };

  const handleVoiceMessageSent = async (durationInSeconds: number): Promise<void> => {
    if (!selectedContactId) return;
    
    await sendVoiceMessage(selectedContactId, durationInSeconds);
  };

  const contextValue: ConversationContextType = {
    contacts,
    messages,
    selectedContactId,
    loading,
    isTyping,
    isSidebarOpen,
    wallpaper,
    replyTo,
    contactFilter,
    searchTerm,
    selectedDevice,
    chatTypeFilter,
    dateRange,
    assigneeFilter,
    tagFilter,
    filteredConversations,
    groupedConversations,
    activeConversation,
    selectContact,
    toggleSidebar,
    setWallpaper,
    setReplyTo,
    sendMessage: sendMessageHandler,
    sendVoiceMessage,
    setContactFilter,
    setSearchTerm,
    toggleContactStar,
    muteContact,
    archiveContact,
    blockContact,
    reportContact,
    clearChat,
    setSelectedDevice,
    setChatTypeFilter,
    setDateRange,
    setAssigneeFilter,
    setTagFilter,
    resetAllFilters,
    handleSendMessage,
    handleVoiceMessageSent,
    handleDeleteConversation,
    handleArchiveConversation,
    handleAddTag,
    handleAssignConversation,
    messagesEndRef,
    isReplying: !!replyTo,
    replyToMessage: replyTo,
    cannedReplies,
    aiAssistantActive,
    isAssistantActive,
    setAiAssistantActive,
    handleAddReaction: addReaction,
    handleReplyToMessage,
    handleCancelReply,
    handleUseCannedReply,
    handleRequestAIAssistance,
    handleAddContact,
    setIsSidebarOpen,
    setActiveConversation,
    deleteMessage,
    addReaction,
    toggleAssistant
  };

  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = (): ConversationContextType => {
  const context = useContext(ConversationContext);
  
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  
  return context;
};
