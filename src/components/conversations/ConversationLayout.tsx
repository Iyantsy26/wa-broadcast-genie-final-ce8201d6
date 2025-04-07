
import React, { useState, useEffect, useRef } from 'react';
import ContactSidebar from './ContactSidebar';
import MessagePanel from './MessagePanel';
import ContactInfoSidebar from './ContactInfoSidebar';
import NoConversation from './NoConversation';
import { useConversation } from '@/contexts/ConversationContext';
import { Contact, Conversation } from '@/types/conversation';
import { getConversations } from '@/services/conversationService';
import { toast } from '@/hooks/use-toast';

const ConversationLayout: React.FC<{ currentDeviceId: string }> = ({ currentDeviceId }) => {
  const {
    contacts,
    filteredContacts,
    selectContact,
    messages,
    isTyping,
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
    selectContact: setSelectedContactId,
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
    handleRequestAIAssistance,
    filteredConversations,
    groupedConversations,
    activeConversation,
    setActiveConversation,
    setChatTypeFilter,
    setDateRange,
    setAssigneeFilter,
    setTagFilter,
    resetAllFilters,
    handleSendMessage,
    handleVoiceMessageSent,
    handleDeleteConversation,
    handleAddTag,
    handleAssignConversation,
    handleReplyToMessage
  } = useConversation();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
      try {
        setIsLoading(true);
        const conversations = await getConversations();
        if (conversations && conversations.length > 0) {
          setActiveConversation(conversations[0]);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversations',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversations();
  }, [setActiveConversation]);

  const handleOpenContactInfo = () => {
    toggleSidebar();
  };
  
  // Add this function for canceling replies
  const handleCancelReply = () => {
    // Implementation for canceling replies
    console.log("Reply canceled");
    setReplyTo(null);
  };
  
  // Function to handle location sharing
  const handleShareLocation = async () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (activeConversation) {
            sendLocation(activeConversation.contact.id, latitude, longitude, currentDeviceId);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Error",
            description: "Could not retrieve location.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full">
      {/* Contact sidebar */}
      <div className="md:col-span-1">
        <ContactSidebar
          filteredContacts={filteredContacts}
          onSelectContact={selectContact}
          selectedContactId={activeConversation?.contact.id || null}
          isSidebarOpen={isSidebarOpen}
          onOpenChange={toggleSidebar}
          onClose={() => toggleSidebar()}
        />
      </div>
      
      {/* Main content area */}
      <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full">
        {activeConversation ? (
          <MessagePanel
            contact={activeConversation.contact}
            conversation={activeConversation}
            messages={messages[activeConversation.id] || []}
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
            onOpenContactInfo={handleOpenContactInfo}
            onSendMessage={handleSendMessage}
            onVoiceMessageSent={handleVoiceMessageSent}
            onReaction={handleAddReaction}
            onReply={handleReplyToMessage}
            onCancelReply={handleCancelReply}
            onLocationShare={handleShareLocation}
            deviceId={currentDeviceId}
          />
        ) : (
          <NoConversation />
        )}
      </div>
      
      {/* Contact info sidebar */}
      {activeConversation && (
        <ContactInfoSidebar
          conversation={activeConversation}
          isOpen={isSidebarOpen}
          onOpenChange={toggleSidebar}
          onClose={() => toggleSidebar()}
        />
      )}
    </div>
  );
};

export default ConversationLayout;
