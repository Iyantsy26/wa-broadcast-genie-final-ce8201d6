
import React, { useState } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import ConversationList from './ConversationList';
import NoConversation from './NoConversation';
import ContactInfoSidebar from './ContactInfoSidebar';
import DeviceSelector from './DeviceSelector';
import AIAssistantPanel from './AIAssistantPanel';
import CannedResponseSelector from './CannedResponseSelector';
import AddContactButton from './AddContactButton';
import { Button } from "@/components/ui/button";
import { Bot, MessageSquarePlus, Settings } from 'lucide-react';
import { ChatType, Contact } from '@/types/conversation';
import MessageList from '../chat/MessageList';
import MessageInput from '../chat/MessageInput';
import ChatHeader from '../chat/ChatHeader';
import { toast } from '@/hooks/use-toast';
import CannedResponseManager from './inputs/CannedResponseManager';
import AIAutoReply from './inputs/AIAutoReply';

const ConversationPage = () => {
  const {
    filteredConversations,
    groupedConversations,
    activeConversation,
    messages,
    isSidebarOpen,
    isTyping,
    isReplying,
    replyTo,
    cannedResponses = [],
    selectedDevice,
    aiAssistantActive,
    chatTypeFilter,
    searchTerm,
    dateRange,
    assigneeFilter,
    tagFilter,
    soundEnabled,
    wallpaper,
    messagesEndRef,
    setActiveConversation,
    setIsSidebarOpen,
    setSelectedDevice,
    setAiAssistantActive,
    setChatTypeFilter,
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
    requestAIAssistance,
    addContact,
    toggleSoundEnabled,
    setWallpaper
  } = useConversation();

  const [wallpapers] = useState([
    null,
    '/backgrounds/chat-bg-1.jpg',
    '/backgrounds/chat-bg-2.jpg',
    '/backgrounds/chat-bg-3.jpg'
  ]);
  
  const [showCannedResponseManager, setShowCannedResponseManager] = useState(false);
  const [showAutoReplySettings, setShowAutoReplySettings] = useState(false);
  const [autoReplySettings, setAutoReplySettings] = useState({
    enabled: false,
    message: "Hello! I'm currently unavailable. My AI assistant will help you in the meantime. I'll respond personally as soon as I'm back.",
    activationDelay: 15,
    respondToAll: false
  });

  const handleAddContact = (name: string, phone: string, type: ChatType) => {
    const newContact: Contact = {
      id: `new-${Date.now()}`,
      name,
      phone,
      type,
      tags: [],
      isOnline: false
    };
    addContact(newContact);
  };

  const pinConversation = (conversationId: string) => {
    console.log('Pin conversation not implemented:', conversationId);
  };

  const activeMessages = activeConversation ? 
    (messages[activeConversation.id] || []) : [];

  const handleRequestAIAssistancePromise = async (prompt: string): Promise<string> => {
    try {
      return await requestAIAssistance(prompt);
    } catch (error) {
      console.error('Error requesting AI assistance:', error);
      return 'Failed to get AI assistance';
    }
  };

  const handleWallpaperChange = (wallpaperUrl: string | null) => {
    setWallpaper(wallpaperUrl);
    toast({
      title: wallpaperUrl ? 'Wallpaper changed' : 'Wallpaper removed',
    });
  };

  const handleSaveCannedResponses = (responses: any[]) => {
    // In a real app, this would save to backend/context
    toast({
      title: "Canned responses saved",
      description: `${responses.length} responses saved successfully`,
    });
  };

  const handleSaveAutoReplySettings = (settings: any) => {
    setAutoReplySettings(settings);
    toast({
      title: settings.enabled ? "AI Auto-Reply enabled" : "AI Auto-Reply disabled",
      description: settings.enabled 
        ? `The assistant will activate after ${settings.activationDelay} minutes of inactivity` 
        : "Auto responses have been disabled",
    });
  };

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="flex-none flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
          <p className="text-muted-foreground">
            Chat with clients, leads and team through WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddContactButton onAddContact={handleAddContact} />
          
          <Button 
            variant="outline" 
            onClick={() => setShowCannedResponseManager(true)}
            className="flex items-center gap-1"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>Manage Responses</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowAutoReplySettings(true)}
            className="flex items-center gap-1"
          >
            <Bot className="h-4 w-4" />
            <span>Auto-Reply</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setAiAssistantActive(!aiAssistantActive)}
          >
            {aiAssistantActive ? 'Hide AI Assistant' : 'Show AI Assistant'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={toggleSoundEnabled}
            title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
          >
            {soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          </Button>
          
          <select 
            className="rounded border p-2"
            onChange={(e) => handleWallpaperChange(e.target.value === 'none' ? null : e.target.value)}
            value={wallpaper || 'none'}
          >
            <option value="none">No Wallpaper</option>
            {wallpapers.filter(wp => wp !== null).map((wp, index) => (
              <option key={index} value={wp}>
                Wallpaper {index + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <DeviceSelector 
          selectedDevice={selectedDevice} 
          onSelectDevice={setSelectedDevice} 
        />
      </div>
      
      <div className="flex-1 flex space-x-4 overflow-hidden bg-gray-50 rounded-lg p-2">
        <ConversationList 
          conversations={filteredConversations || []}
          groupedConversations={groupedConversations || {}}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          chatTypeFilter={chatTypeFilter || 'all'}
          setChatTypeFilter={setChatTypeFilter}
          searchTerm={searchTerm || ''}
          setSearchTerm={setSearchTerm}
          dateRange={dateRange}
          setDateRange={setDateRange}
          assigneeFilter={assigneeFilter || ''}
          setAssigneeFilter={setAssigneeFilter}
          tagFilter={tagFilter || ''}
          setTagFilter={setTagFilter}
          resetAllFilters={resetAllFilters}
          pinConversation={pinConversation}
          archiveConversation={handleArchiveConversation}
        />
        
        <div 
          className="flex-1 flex flex-col border rounded-lg bg-white shadow-sm overflow-hidden"
          style={wallpaper ? { backgroundImage: `url(${wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {activeConversation ? (
            <>
              <ChatHeader 
                conversation={activeConversation}
                onOpenContactInfo={() => setIsSidebarOpen(true)}
              />
              <MessageList 
                messages={activeMessages} 
                contactName={activeConversation.contact.name}
                messagesEndRef={messagesEndRef}
                isTyping={isTyping}
                onReaction={handleAddReaction}
                onReply={handleReplyToMessage}
              />
              <div className="flex-shrink-0">
                {isReplying && replyTo && (
                  <div className="p-2 bg-gray-100 border-t flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-xs font-medium">Replying to:</span>
                      <p className="text-sm truncate">{replyTo.content}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleCancelReply}>
                      Cancel
                    </Button>
                  </div>
                )}
                <CannedResponseSelector 
                  cannedReplies={cannedResponses || []}
                  onSelectReply={handleUseCannedReply || (() => {})}
                />
                <MessageInput 
                  onSendMessage={handleSendMessage}
                  onVoiceMessageSent={handleVoiceMessageSent}
                  replyTo={replyTo}
                  onCancelReply={handleCancelReply || (() => {})}
                  onRequestAIAssistance={handleRequestAIAssistancePromise}
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
            onRequestAIAssistance={handleRequestAIAssistancePromise}
            onClose={() => setAiAssistantActive(false)}
          />
        )}
      </div>
      
      {/* Dialog for managing canned responses */}
      <CannedResponseManager
        isOpen={showCannedResponseManager}
        onClose={() => setShowCannedResponseManager(false)}
        initialResponses={cannedResponses || []}
        onSave={handleSaveCannedResponses}
      />
      
      {/* Dialog for AI auto-reply settings */}
      <AIAutoReply
        isOpen={showAutoReplySettings}
        onClose={() => setShowAutoReplySettings(false)}
        onSave={handleSaveAutoReplySettings}
      />
    </div>
  );
};

export default ConversationPage;
