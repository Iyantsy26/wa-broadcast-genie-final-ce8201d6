
import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, parseISO } from 'date-fns';
import { Conversation, Message } from '@/types/conversation';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  deleteConversation, 
  archiveConversation,
  addTagToConversation,
  assignConversation
} from '@/services/conversationService';
import { toast } from '@/hooks/use-toast';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [groupedConversations, setGroupedConversations] = useState<{[name: string]: Conversation[]}>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    let filtered = [...conversations];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(convo => convo.status === statusFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(convo => 
        convo.contact.name.toLowerCase().includes(term) || 
        (convo.contact.phone && convo.contact.phone.includes(term)) ||
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
    
    const grouped = filtered.reduce((acc, conversation) => {
      const name = conversation.contact.name;
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(conversation);
      return acc;
    }, {} as {[name: string]: Conversation[]});
    
    setGroupedConversations(grouped);
  }, [conversations, statusFilter, searchTerm, dateRange, assigneeFilter, tagFilter]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
      
      if (!activeConversation && data.length > 0) {
        setActiveConversation(data[0]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const data = await getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (content: string, file: File | null) => {
    if (!activeConversation) return;
    
    const timestamp = new Date().toISOString();
    
    let newMessage: Omit<Message, 'id'> = {
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
    
    try {
      const tempId = `temp-${Date.now()}`;
      const tempMessage = { ...newMessage, id: tempId };
      setMessages(prev => [...prev, tempMessage]);
      
      const savedMessage = await sendMessage(activeConversation.id, newMessage);
      
      setMessages(prev => 
        prev.map(m => m.id === tempId ? savedMessage : m)
      );
      
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
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleVoiceMessageSent = async (durationInSeconds: number) => {
    if (!activeConversation) return;
    
    const timestamp = new Date().toISOString();
    
    const voiceMessage: Omit<Message, 'id'> = {
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
    
    try {
      const tempId = `temp-voice-${Date.now()}`;
      const tempMessage = { ...voiceMessage, id: tempId };
      setMessages(prev => [...prev, tempMessage]);
      
      const savedMessage = await sendMessage(activeConversation.id, voiceMessage);
      
      setMessages(prev => 
        prev.map(m => m.id === tempId ? savedMessage : m)
      );
      
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
      
      toast({
        title: "Voice message sent",
        description: `Voice message (${durationInSeconds}s) has been sent.`,
      });
    } catch (error) {
      console.error("Error sending voice message:", error);
      toast({
        title: "Error",
        description: "Failed to send voice message",
        variant: "destructive",
      });
    }
  };

  const resetAllFilters = () => {
    setStatusFilter('all');
    setDateRange(undefined);
    setAssigneeFilter('');
    setTagFilter('');
    setSearchTerm('');
  };

  const handleDeleteConversation = async (conversationId: string): Promise<void> => {
    try {
      // Check if we're deleting the active conversation
      const isActive = activeConversation?.id === conversationId;

      // Optimistically update UI first (remove from local state)
      setConversations(prev => prev.filter(convo => convo.id !== conversationId));
      
      // If we're deleting the active conversation, set a new active one
      if (isActive) {
        const remainingConversations = conversations.filter(c => c.id !== conversationId);
        setActiveConversation(remainingConversations.length > 0 ? remainingConversations[0] : null);
        setMessages([]);
      }
      
      // Then perform the actual API deletion
      await deleteConversation(conversationId);
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      // Rollback by refreshing the conversations to restore accurate state
      fetchConversations();
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleArchiveConversation = async (conversationId: string): Promise<void> => {
    try {
      // Find the conversation to update
      const convoToUpdate = conversations.find(c => c.id === conversationId);
      if (!convoToUpdate) throw new Error("Conversation not found");

      // Optimistically update UI
      const updatedConvo = { ...convoToUpdate, status: 'archived' };
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? updatedConvo : c)
      );

      // If this is the active conversation, update it too
      if (activeConversation?.id === conversationId) {
        setActiveConversation(updatedConvo);
      }

      // Perform the actual API update
      await archiveConversation(conversationId);
    } catch (error) {
      console.error("Error archiving conversation:", error);
      // Rollback by refreshing conversations
      fetchConversations();
      throw error;
    }
  };

  const handleAddTag = async (conversationId: string, tag: string): Promise<void> => {
    try {
      // Find the conversation to update
      const convoToUpdate = conversations.find(c => c.id === conversationId);
      if (!convoToUpdate) throw new Error("Conversation not found");

      // Prepare tags array
      const currentTags = convoToUpdate.tags || [];
      if (currentTags.includes(tag)) return; // Tag already exists
      
      const updatedTags = [...currentTags, tag];

      // Optimistically update UI
      const updatedConvo = { ...convoToUpdate, tags: updatedTags };
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? updatedConvo : c)
      );

      // If this is the active conversation, update it too
      if (activeConversation?.id === conversationId) {
        setActiveConversation(updatedConvo);
      }

      // Perform the actual API update
      await addTagToConversation(conversationId, tag);
    } catch (error) {
      console.error("Error adding tag:", error);
      // Rollback by refreshing conversations
      fetchConversations();
      throw error;
    }
  };

  const handleAssignConversation = async (conversationId: string, assignee: string): Promise<void> => {
    try {
      // Find the conversation to update
      const convoToUpdate = conversations.find(c => c.id === conversationId);
      if (!convoToUpdate) throw new Error("Conversation not found");

      // Optimistically update UI
      const updatedConvo = { ...convoToUpdate, assignedTo: assignee };
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? updatedConvo : c)
      );

      // If this is the active conversation, update it too
      if (activeConversation?.id === conversationId) {
        setActiveConversation(updatedConvo);
      }

      // Perform the actual API update
      await assignConversation(conversationId, assignee);
    } catch (error) {
      console.error("Error assigning conversation:", error);
      // Rollback by refreshing conversations
      fetchConversations();
      throw error;
    }
  };

  return {
    conversations,
    filteredConversations,
    groupedConversations,
    activeConversation,
    messages,
    loading,
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
    refreshConversations: fetchConversations,
    handleDeleteConversation,
    handleArchiveConversation,
    handleAddTag,
    handleAssignConversation
  };
};
