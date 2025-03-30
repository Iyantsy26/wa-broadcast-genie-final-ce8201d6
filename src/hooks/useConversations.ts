
import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, parseISO } from 'date-fns';
import { Conversation, Message } from '@/types/conversation';
import { getConversations, getMessages, sendMessage } from '@/services/conversationService';
import { toast } from '@/hooks/use-toast';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  // Filter conversations based on filters
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
  }, [conversations, statusFilter, searchTerm, dateRange, assigneeFilter, tagFilter]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
      
      // Set active conversation to the first one if none is selected
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
      // Add message optimistically to UI
      const tempId = `temp-${Date.now()}`;
      const tempMessage = { ...newMessage, id: tempId };
      setMessages(prev => [...prev, tempMessage]);
      
      // Send to server
      const savedMessage = await sendMessage(activeConversation.id, newMessage);
      
      // Replace temp message with saved one
      setMessages(prev => 
        prev.map(m => m.id === tempId ? savedMessage : m)
      );
      
      // Update conversation in list
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
      // Add message optimistically to UI
      const tempId = `temp-voice-${Date.now()}`;
      const tempMessage = { ...voiceMessage, id: tempId };
      setMessages(prev => [...prev, tempMessage]);
      
      // Send to server
      const savedMessage = await sendMessage(activeConversation.id, voiceMessage);
      
      // Replace temp message with saved one
      setMessages(prev => 
        prev.map(m => m.id === tempId ? savedMessage : m)
      );
      
      // Update conversation in list
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

  return {
    conversations,
    filteredConversations,
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
    refreshConversations: fetchConversations
  };
};
