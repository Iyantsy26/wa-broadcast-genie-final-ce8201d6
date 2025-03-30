
import { useState, useEffect, useRef } from 'react';
import { Conversation, Message } from '@/types/conversation';
import { getMessages, sendMessage } from '@/services/conversationService';
import { toast } from '@/hooks/use-toast';

export const useConversationMessages = (
  activeConversation: Conversation | null,
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>,
  setActiveConversation: React.Dispatch<React.SetStateAction<Conversation | null>>
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

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

  return {
    messages,
    messagesEndRef,
    handleSendMessage,
    handleVoiceMessageSent
  };
};
