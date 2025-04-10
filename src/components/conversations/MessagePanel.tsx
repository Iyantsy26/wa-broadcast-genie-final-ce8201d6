
import React, { useRef, useEffect, useState } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import { Contact, Message } from '@/types/conversation';
import ConversationHeader from './ConversationHeader';
import MessageList from './MessageList';
import MessageInputBar from './MessageInputBar';

interface MessagePanelProps {
  contact: Contact;
  deviceId: string;
  wallpaper?: string | null;
  soundEnabled?: boolean;
  disappearingMessages?: {
    enabled: boolean;
    timeout: number;
  };
  onClearChat?: (contactId: string) => void;
  onToggleStar?: (contactId: string) => void;
  onToggleMute?: (contactId: string, isMuted: boolean) => void;
  onToggleDisappearing?: (enabled: boolean) => void;
  onSetDisappearingTimeout?: (hours: number) => void;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ 
  contact, 
  deviceId,
  wallpaper,
  soundEnabled = true,
  disappearingMessages = { enabled: false, timeout: 24 },
  onClearChat,
  onToggleStar,
  onToggleMute,
  onToggleDisappearing,
  onSetDisappearingTimeout
}) => {
  const {
    messages,
    isTyping,
    replyTo,
    messagesEndRef,
    toggleSidebar,
    sendMessage,
    sendVoiceMessage,
    setReplyTo,
    addReaction,
    deleteMessage
  } = useConversation();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeAttachmentType, setActiveAttachmentType] = useState<string | null>(null);
  
  const contactMessages = messages[contact.id] || [];
  
  // Set background style if wallpaper is set
  const backgroundStyle = wallpaper
    ? { backgroundImage: `url(${wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};
  
  const handleSendMessage = (message: string) => {
    if (selectedFile) {
      // Handle file attachment
      console.log('Sending message with attachment:', selectedFile.name);
      // In a real implementation, you would upload the file and get a URL
      const fileUrl = URL.createObjectURL(selectedFile);
      
      // Create a message object with the file attachment
      const fileType = getFileTypeCategory(selectedFile.type);
      const content = message || `Sent a ${fileType}`;
      
      // Send the message with file information
      const messageWithAttachment = {
        content,
        fileUrl,
        fileType,
        fileName: selectedFile.name
      };
      
      // This would be replaced with an actual API call to send the message with attachment
      console.log('Sending message with attachment:', messageWithAttachment);
      
      // Then send the regular message
      sendMessage(contact.id, content, deviceId);
      
      // Clear the selected file
      setSelectedFile(null);
      setActiveAttachmentType(null);
    } else {
      sendMessage(contact.id, message, deviceId);
    }
  };

  const handleSendVoiceMessage = (durationInSeconds: number) => {
    sendVoiceMessage(contact.id, durationInSeconds, deviceId);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };
  
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };
  
  const handleForwardMessage = (messageId: string, contactIds: string[]) => {
    // Implement message forwarding logic here
    console.log('Forwarding message', messageId, 'to contacts', contactIds);
  };
  
  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const locationMessage = `My location: https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
        sendMessage(contact.id, locationMessage, deviceId);
      }, (error) => {
        console.error('Error getting location:', error);
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  // Clean up disappearing messages
  useEffect(() => {
    if (disappearingMessages.enabled) {
      const now = new Date();
      const timeoutMs = disappearingMessages.timeout * 60 * 60 * 1000; // Convert hours to milliseconds
      
      const expiredMessageIds = contactMessages
        .filter(msg => {
          const msgDate = new Date(msg.timestamp);
          return (now.getTime() - msgDate.getTime()) > timeoutMs;
        })
        .map(msg => msg.id);
      
      // Delete expired messages
      expiredMessageIds.forEach(id => {
        deleteMessage(id);
      });
    }
  }, [contactMessages, disappearingMessages, deleteMessage]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Conversation header */}
      <ConversationHeader 
        contact={contact} 
        onInfoClick={toggleSidebar}
        deviceId={deviceId}
        onToggleStar={onToggleStar ? () => onToggleStar(contact.id) : undefined}
        onToggleMute={onToggleMute ? (isMuted) => onToggleMute(contact.id, isMuted) : undefined}
        onClearChat={onClearChat ? () => onClearChat(contact.id) : undefined}
      />
      
      {/* Message list */}
      <div 
        className="flex-1 overflow-y-auto bg-slate-50" 
        style={backgroundStyle}
      >
        <MessageList 
          messages={contactMessages}
          contact={contact}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
          onReaction={handleReaction}
          onReply={handleReply}
          onForward={handleForwardMessage}
          disappearingEnabled={disappearingMessages.enabled}
          disappearingTimeout={disappearingMessages.timeout}
        />
      </div>
      
      {/* Message input */}
      <MessageInputBar
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSendMessage={handleSendMessage}
        onSendVoiceMessage={handleSendVoiceMessage}
        deviceId={deviceId}
        onFileSelect={handleFileSelect}
        selectedFile={selectedFile}
        onRemoveFile={() => setSelectedFile(null)}
        activeAttachmentType={activeAttachmentType}
        setActiveAttachmentType={setActiveAttachmentType}
        onShareLocation={handleShareLocation}
        soundEnabled={soundEnabled}
      />
    </div>
  );
};

export default MessagePanel;
