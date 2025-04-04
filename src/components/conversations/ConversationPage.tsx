
import React from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import ConversationList from './ConversationList';
import ConversationHeader from './ConversationHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import NoConversation from './NoConversation';
import ContactInfoSidebar from './ContactInfoSidebar';
import DeviceSelector from './DeviceSelector';
import AIAssistantPanel from './AIAssistantPanel';
import CannedResponseSelector from './CannedResponseSelector';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, UserCircle } from 'lucide-react';

const ConversationPage = () => {
  const {
    filteredConversations,
    groupedConversations,
    activeConversation,
    messages,
    isSidebarOpen,
    isTyping,
    isReplying,
    replyToMessage,
    cannedReplies,
    selectedDevice,
    aiAssistantActive,
    statusFilter,
    searchTerm,
    dateRange,
    assigneeFilter,
    tagFilter,
    messagesEndRef,
    setActiveConversation,
    setIsSidebarOpen,
    setSelectedDevice,
    setAiAssistantActive,
    setStatusFilter,
    setSearchTerm,
    setDateRange,
    setAssigneeFilter,
    setTagFilter,
    resetAllFilters,
    handleSendMessage,
    handleVoiceMessageSent,
    handleArchiveConversation,
    handleDeleteConversation,
    handleAddReaction,
    handleReplyToMessage,
    handleCancelReply,
    handleUseCannedReply,
    handleRequestAIAssistance
  } = useConversation();

  const [viewMode, setViewMode] = React.useState('all');

  // Define dummy pinConversation function to satisfy the interface
  const pinConversation = (conversationId: string) => {
    console.log('Pin conversation not implemented:', conversationId);
  };

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="flex-none">
        <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
        <p className="text-muted-foreground">
          Chat with clients, leads and team through WhatsApp
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <DeviceSelector 
          selectedDevice={selectedDevice} 
          onSelectDevice={setSelectedDevice} 
        />
        
        <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
          <TabsList className="grid grid-cols-3 w-[300px]">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-1">
              <UserCircle className="h-4 w-4" />
              <span>Clients</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Team</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button 
          variant="outline" 
          onClick={() => setAiAssistantActive(!aiAssistantActive)}
        >
          {aiAssistantActive ? 'Hide AI Assistant' : 'Show AI Assistant'}
        </Button>
      </div>
      
      <div className="flex-1 flex space-x-4 overflow-hidden bg-gray-50 rounded-lg p-2">
        <ConversationList 
          conversations={filteredConversations.filter(c => 
            viewMode === 'all' || c.chatType === viewMode.replace('s', '')
          )}
          groupedConversations={Object.fromEntries(
            Object.entries(groupedConversations).filter(([key, convs]) => 
              viewMode === 'all' || convs.some(c => c.chatType === viewMode.replace('s', ''))
            )
          )}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateRange={dateRange}
          setDateRange={setDateRange}
          assigneeFilter={assigneeFilter}
          setAssigneeFilter={setAssigneeFilter}
          tagFilter={tagFilter}
          setTagFilter={setTagFilter}
          resetAllFilters={resetAllFilters}
          pinConversation={pinConversation}
          archiveConversation={handleArchiveConversation}
        />
        
        <div className="flex-1 flex flex-col border rounded-lg bg-white shadow-sm overflow-hidden">
          {activeConversation ? (
            <>
              <ConversationHeader 
                conversation={activeConversation}
                onOpenContactInfo={() => setIsSidebarOpen(true)}
              />
              <MessageList 
                messages={messages} 
                contactName={activeConversation.contact.name}
                messagesEndRef={messagesEndRef}
                isTyping={isTyping}
                onReaction={handleAddReaction}
                onReply={handleReplyToMessage}
              />
              <div className="flex-shrink-0">
                {isReplying && replyToMessage && (
                  <div className="p-2 bg-gray-100 border-t flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-xs font-medium">Replying to:</span>
                      <p className="text-sm truncate">{replyToMessage.content}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleCancelReply}>
                      Cancel
                    </Button>
                  </div>
                )}
                <CannedResponseSelector 
                  cannedReplies={cannedReplies}
                  onSelectReply={handleUseCannedReply}
                />
                <MessageInput 
                  onSendMessage={handleSendMessage}
                  onVoiceMessageSent={handleVoiceMessageSent}
                  replyTo={replyToMessage}
                  onCancelReply={handleCancelReply}
                  onRequestAIAssistance={handleRequestAIAssistance}
                />
              </div>
            </>
          ) : (
            <NoConversation />
          )}
        </div>
        
        {activeConversation && isSidebarOpen && (
          <ContactInfoSidebar 
            conversation={activeConversation}
            isOpen={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
        
        {aiAssistantActive && (
          <AIAssistantPanel 
            onRequestAIAssistance={handleRequestAIAssistance}
            onClose={() => setAiAssistantActive(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ConversationPage;
