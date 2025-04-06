
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

// Context type definition
interface ConversationContextType {
  // State
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
  
  // UI State
  chatTypeFilter: ChatType | 'all';
  dateRange?: DateRange;
  assigneeFilter: string;
  tagFilter: string;
  
  // Derived state
  filteredConversations: Conversation[];
  groupedConversations: { [key: string]: Conversation[] };
  activeConversation: Conversation | null;
  
  // Methods
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
  
  // Filter methods
  setChatTypeFilter: (filter: ChatType | 'all') => void;
  setDateRange: (range: DateRange | undefined) => void;
  setAssigneeFilter: (assignee: string) => void;
  setTagFilter: (tag: string) => void;
  resetAllFilters: () => void;
  
  // Action methods
  handleSendMessage: (content: string, file: File | null, replyToMessageId?: string) => Promise<void>;
  handleVoiceMessageSent: (durationInSeconds: number) => Promise<void>;
  handleDeleteConversation: (conversationId: string) => Promise<void>;
  handleArchiveConversation: (conversationId: string, isArchived?: boolean) => Promise<void>;
  handleAddTag: (conversationId: string, tag: string) => Promise<void>;
  handleAssignConversation: (conversationId: string, assignee: string) => Promise<void>;
  
  // Refs
  messagesEndRef: React.RefObject<HTMLDivElement>;
  
  // Additional features for extended components
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

// Create context with initial values
const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

// Provider component
interface ConversationProviderProps {
  children: ReactNode;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({ children }) => {
  // State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [contactFilter, setContactFilter] = useState<ChatType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDevice, setSelectedDevice] = useState<string>("1"); // Default to first device
  const [aiAssistantActive, setAiAssistantActive] = useState<boolean>(false);
  const [isAssistantActive, setIsAssistantActive] = useState<boolean>(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Define setActiveConversation at the top to avoid the reference error
  const setActiveConversation = useCallback((conversation: Conversation | null) => {
    if (conversation) {
      setSelectedContactId(conversation.contact.id);
    } else {
      setSelectedContactId(null);
    }
  }, []);
  
  // Canned replies
  const cannedReplies = [
    { id: '1', title: 'Greeting', content: 'Hello! How can I help you today?' },
    { id: '2', title: 'Thank You', content: 'Thank you for reaching out. We appreciate your interest!' },
    { id: '3', title: 'Follow Up', content: "Just following up on our conversation. Do you have any questions I can help with?" },
  ];
  
  // Use custom hooks for filtering and actions
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
  
  const activeConversation = selectedContactId 
    ? conversations.find(c => c.contact.id === selectedContactId) || null
    : null;
    
  // Load contacts and conversations on mount
  useEffect(() => {
    loadContacts();
  }, []);
  
  // Load messages when contact changes
  useEffect(() => {
    if (selectedContactId) {
      const conversation = conversations.find(c => c.contact.id === selectedContactId);
      if (conversation && !messages[selectedContactId]) {
        loadMessages(selectedContactId);
      }
    }
  }, [selectedContactId, conversations]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedContactId]);
  
  // Load contacts from Supabase
  const loadContacts = async () => {
    setLoading(true);
    try {
      // Fetch conversations which will include contact information
      const fetchedConversations = await getConversations();
      
      if (fetchedConversations.length > 0) {
        // Extract unique contacts from conversations
        const uniqueContacts = fetchedConversations.map(conv => ({
          ...conv.contact,
          tags: conv.contact.tags || []
        }));
        
        setContacts(uniqueContacts);
        setConversations(fetchedConversations);
        
        // Select first contact
        if (!selectedContactId && fetchedConversations.length > 0) {
          setSelectedContactId(fetchedConversations[0].contact.id);
          
          // Load messages for the selected contact
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

  // Load messages for all contacts
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
          // Transform database messages to our Message type
          const transformedMessages: Message[] = messageData.map(msg => ({
            id: msg.id,
            content: msg.content,
            timestamp: msg.timestamp,
            isOutbound: msg.is_outbound,
            status: msg.status as MessageStatus,
            sender: msg.sender,
            type: msg.message_type as MessageType,
            media: msg.media_url ? {
              url: msg.media_url,
              type: msg.media_type as 'image' | 'video' | 'document' | 'voice',
              filename: msg.media_filename,
              duration: msg.media_duration,
            } : undefined,
            replyTo: msg.reply_to_id ? {
              id: msg.reply_to_id,
              content: msg.reply_to_content || "Original message",
              sender: msg.reply_to_sender || "Sender",
              type: (msg.reply_to_type as MessageType) || "text",
              status: "sent",
              isOutbound: msg.reply_to_is_outbound || false,
              timestamp: msg.reply_to_timestamp || msg.timestamp
            } : undefined,
            reactions: []
          }));
          
          allMessages[contactId] = transformedMessages;
        }
      }
      
      setMessages(allMessages);
      
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };
  
  // Load messages for a specific contact
  const loadMessages = async (contactId: string) => {
    try {
      const conversation = conversations.find(c => c.contact.id === contactId);
      
      if (!conversation) {
        throw new Error(`No conversation found for contact ${contactId}`);
      }
      
      const conversationMessages = await getMessages(conversation.id);
      
      // Update messages state
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
  
  // Scroll to bottom of message list
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Select a contact
  const selectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setIsSidebarOpen(false);
  };
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  // Toggle assistant
  const toggleAssistant = () => {
    setIsAssistantActive(prev => !prev);
  };
  
  // Send a message
  const sendMessageHandler = async (contactId: string, content: string) => {
    if (!content.trim()) return;
    
    const conversation = conversations.find(c => c.contact.id === contactId);
    
    if (!conversation) {
      console.error("No conversation found for contact", contactId);
      return;
    }
    
    // Create a temporary message to show in the UI
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sending',
      sender: 'You',
      type: 'text'
    };
    
    // Add the temp message to the UI
    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), tempMessage]
    }));
    
    // Scroll to bottom
    scrollToBottom();
    
    try {
      // Send the message to the server
      const sentMessage = await sendMessage(
        conversation.id,
        content,
        'text',
        'You'
      );
      
      // Update the message with the server response
      setMessages(prev => ({
        ...prev,
        [contactId]: prev[contactId].map(msg => 
          msg.id === tempMessage.id ? sentMessage : msg
        )
      }));
      
      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id 
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
      
      // Clear reply to
      setReplyTo(null);
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Update message status to error
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
  
  // Send a voice message
  const sendVoiceMessage = async (contactId: string, durationInSeconds: number) => {
    const conversation = conversations.find(c => c.contact.id === contactId);
    
    if (!conversation) {
      console.error("No conversation found for contact", contactId);
      return;
    }
    
    // Create a temporary voice message
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
    
    // Add to UI
    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), tempMessage]
    }));
    
    // Scroll to bottom
    scrollToBottom();
    
    try {
      // Mock sending voice message
      // In reality, this would upload the voice file to storage
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [contactId]: prev[contactId].map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, status: 'delivered' as MessageStatus } 
              : msg
          )
        }));
        
        // Update conversation last message
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversation.id 
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
  
  // Toggle star status for a contact
  const toggleContactStar = (contactId: string) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, isStarred: !contact.isStarred } 
          : contact
      )
    );
  };
  
  // Mute/unmute a contact
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
  
  // Archive/unarchive a contact
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
  
  // Block/unblock a contact
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
  
  // Report a contact
  const reportContact = (contactId: string) => {
    toast({
      title: "Contact reported",
      description: "Thank you for your report. We will review it shortly.",
    });
  };
  
  // Clear chat history
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
  
  // Use conversation actions hook
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
  
  // Add a reaction to a message
  const addReaction = (messageId: string, emoji: string) => {
    if (!selectedContactId) return;
    
    setMessages(prev => {
      const contactMessages = [...prev[selectedContactId]];
      const messageIndex = contactMessages.findIndex(m => m.id === messageId);
      
      if (messageIndex !== -1) {
        const message = contactMessages[messageIndex];
        const reactions = message.reactions || [];
        
        // Check if user already reacted with this emoji
        const existingReaction = reactions.findIndex(r => r.userId === 'current-user' && r.emoji === emoji);
        
        if (existingReaction !== -1) {
          // Remove the reaction
          reactions.splice(existingReaction, 1);
        } else {
          // Add the reaction
          reactions.push({
            emoji,
            userId: 'current-user',
            userName: 'You',
            timestamp: new Date().toISOString()
          });
        }
        
        // Update the message
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
  
  // Delete a message
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
  
  // Reply to a message
  const handleReplyToMessage = (message: Message) => {
    setReplyTo(message);
  };
  
  // Cancel reply
  const handleCancelReply = () => {
    setReplyTo(null);
  };
  
  // Use a canned reply
  const handleUseCannedReply = (replyContent: string) => {
    if (selectedContactId) {
      sendMessageHandler(selectedContactId, replyContent);
    }
  };
  
  // Request AI assistance
  const handleRequestAIAssistance = async (prompt: string): Promise<string> => {
    toast({
      title: "AI Assistant",
      description: "Generating response...",
    });
    
    // Mock AI response - in a real app this would call an AI service
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
  
  // Add a new contact
  const handleAddContact = (contactData: Partial<Contact>) => {
    // In a real app, this would create a contact in the database
    const newContact: Contact = {
      id: `new-${Date.now()}`,
      name: contactData.name || 'New Contact',
      avatar: contactData.avatar,
      phone: contactData.phone || '',
      type: contactData.type || 'lead',
      isOnline: false,
      tags: contactData.tags || [],
    };
    
    // Add to contacts list
    setContacts(prev => [...prev, newContact]);
    
    // Create a new conversation
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      contact: newContact,
      lastMessage: {
        content: 'New conversation',
        timestamp: new Date().toISOString(),
        isOutbound: true,
        isRead: true
      },
      chatType: newContact.type,
      tags: [],
    };
    
    // Add to conversations list
    setConversations(prev => [...prev, newConversation]);
    
    // Select the new contact
    setSelectedContactId(newContact.id);
    
    toast({
      title: "Contact added",
      description: `${newContact.name} has been added to your contacts`,
    });
  };
  
  // Handler for send message from other components
  const handleSendMessage = async (content: string, file: File | null, replyToMessageId?: string): Promise<void> => {
    if (!selectedContactId) return;
    
    // For now, ignore file and replyToMessageId
    await sendMessageHandler(selectedContactId, content);
  };

  // Handler for voice message sent from other components
  const handleVoiceMessageSent = async (durationInSeconds: number): Promise<void> => {
    if (!selectedContactId) return;
    
    await sendVoiceMessage(selectedContactId, durationInSeconds);
  };

  // Context value
  const contextValue: ConversationContextType = {
    // State
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
    
    // UI State
    chatTypeFilter,
    dateRange,
    assigneeFilter,
    tagFilter,
    
    // Derived state
    filteredConversations,
    groupedConversations,
    activeConversation,
    
    // Methods
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
    
    // Filter methods
    setChatTypeFilter,
    setDateRange,
    setAssigneeFilter,
    setTagFilter,
    resetAllFilters,
    
    // Action methods
    handleSendMessage,
    handleVoiceMessageSent,
    handleDeleteConversation,
    handleArchiveConversation,
    handleAddTag,
    handleAssignConversation,
    
    // Refs
    messagesEndRef,
    
    // Additional features
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

// Custom hook to use the context
export const useConversation = (): ConversationContextType => {
  const context = useContext(ConversationContext);
  
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  
  return context;
};
