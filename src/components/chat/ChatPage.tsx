
import React from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import ConversationList from '@/components/chat/ConversationList';
import MessagePanel from '@/components/chat/MessagePanel';
import ContactInfoSidebar from '@/components/chat/ContactInfoSidebar';

const ChatPage = () => {
  const {
    filteredConversations,
    activeConversation,
    messages,
    isSidebarOpen,
    setActiveConversation,
    setIsSidebarOpen,
    handleSendMessage,
    handleVoiceMessageSent,
    messagesEndRef
  } = useConversation();

  return (
    <div className="space-y-4 h-full flex flex-col animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
          <p className="text-muted-foreground">
            Manage your team and client conversations
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-4 h-[calc(100vh-13rem)] overflow-hidden">
        <ConversationList 
          conversations={filteredConversations}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
        />
        
        {activeConversation ? (
          <MessagePanel 
            conversation={activeConversation}
            messages={messages}
            onOpenContactInfo={() => setIsSidebarOpen(true)}
            onSendMessage={handleSendMessage}
            onVoiceMessageSent={handleVoiceMessageSent}
            messagesEndRef={messagesEndRef}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white rounded-lg border shadow-sm">
            <div className="text-center p-8">
              <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
              <p className="text-muted-foreground">
                Select a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
        
        {activeConversation && (
          <ContactInfoSidebar 
            conversation={activeConversation}
            isOpen={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
