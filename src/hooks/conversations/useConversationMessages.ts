
import { useState, useEffect, useRef } from 'react';
import { Message, Conversation } from '@/types/conversation';
import { getMessages, sendMessage } from '@/services/conversations';

export const useConversationMessages = (
  activeConversation: Conversation | null,
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>,
  setActiveConversation: React.Dispatch<React.SetStateAction<Conversation | null>>
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const fetchedMessages = await getMessages(conversationId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async (content: string, file: File | null, replyToMessageId?: string) => {
    if (!activeConversation || (!content.trim() && !file)) return;

    // Create a temporary message to show immediately
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sending',
      type: 'text',
      sender: 'You'
    };

    // Add to UI immediately
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    try {
      let mediaUrl: string | undefined = undefined;
      let messageType = 'text';

      // Handle file upload if provided
      if (file) {
        // File upload logic would go here
        // For now, just mock it
        mediaUrl = 'https://example.com/media/mock-url';
        messageType = file.type.startsWith('image/') ? 'image' : 
                      file.type.startsWith('video/') ? 'video' : 
                      file.type.startsWith('audio/') ? 'voice' : 
                      'document';
      }

      // Send the actual message
      const sentMessage = await sendMessage(
        activeConversation.id,
        content,
        messageType as any,
        'You',
        undefined,
        mediaUrl,
        replyToMessageId
      );

      if (sentMessage) {
        // Replace temp message with actual message
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? sentMessage : msg
        ));

        // Update conversations list with new last message
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation.id 
            ? { 
                ...conv, 
                lastMessage: content,
                lastMessageTimestamp: new Date().toISOString() 
              } 
            : conv
        ));

        // Update active conversation
        setActiveConversation(prev => {
          if (prev && prev.id === activeConversation.id) {
            return {
              ...prev,
              lastMessage: content,
              lastMessageTimestamp: new Date().toISOString()
            };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update the temp message to show error status
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, status: 'error' } 
          : msg
      ));
    }
  };

  const handleVoiceMessageSent = async (durationInSeconds: number) => {
    if (!activeConversation) return;

    // Create a voice message
    const voiceMessage: Message = {
      id: `voice-${Date.now()}`,
      content: 'Voice message',
      timestamp: new Date().toISOString(),
      isOutbound: true,
      status: 'sending',
      type: 'voice',
      sender: 'You',
      media: {
        url: 'https://example.com/voice/mock-url.mp3',
        type: 'voice',
        duration: durationInSeconds,
        filename: `voice-${Date.now()}.mp3`
      }
    };

    // Add to UI immediately
    setMessages(prev => [...prev, voiceMessage]);
    scrollToBottom();

    try {
      // Send the actual message
      const sentMessage = await sendMessage(
        activeConversation.id,
        'Voice message',
        'voice',
        'You'
      );

      if (sentMessage) {
        // Replace temp message with actual message
        setMessages(prev => prev.map(msg => 
          msg.id === voiceMessage.id ? sentMessage : msg
        ));

        // Update conversations list with new last message
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation.id 
            ? { 
                ...conv, 
                lastMessage: 'Voice message',
                lastMessageTimestamp: new Date().toISOString() 
              } 
            : conv
        ));
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      
      // Update the temp message to show error status
      setMessages(prev => prev.map(msg => 
        msg.id === voiceMessage.id 
          ? { ...msg, status: 'error' } 
          : msg
      ));
    }
  };

  return {
    messages,
    isLoading,
    messagesEndRef,
    handleSendMessage,
    handleVoiceMessageSent
  };
};
