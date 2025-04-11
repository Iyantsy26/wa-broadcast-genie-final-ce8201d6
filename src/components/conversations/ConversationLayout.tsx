
import React, { useState, useEffect } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import ContactSidebar from './ContactSidebar';
import MessagePanel from './MessagePanel';
import ContactInfoPanel from './ContactInfoPanel';
import AIAssistantPanel from './AIAssistantPanel';
import EmptyConversation from './EmptyConversation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getFileTypeCategory } from '@/utils/fileUpload';

interface ConversationLayoutProps {
  currentDeviceId: string;
}

const ConversationLayout: React.FC<ConversationLayoutProps> = ({ currentDeviceId }) => {
  const {
    selectedContactId,
    contacts,
    isSidebarOpen,
    isAssistantActive,
    toggleAssistant,
    wallpaper,
    setWallpaper,
    toggleContactStar,
    muteContact,
    clearChat,
    blockContact
  } = useConversation();
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [disappearingMessages, setDisappearingMessages] = useState({
    enabled: false,
    timeout: 24 // hours
  });
  
  const selectedContact = selectedContactId 
    ? contacts.find(c => c.id === selectedContactId) 
    : null;

  const handleRequestAIAssistance = async (prompt: string): Promise<string> => {
    console.log('AI assistance requested with prompt:', prompt);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      return `AI response to: ${prompt}`;
    } catch (error) {
      console.error("Error generating AI response:", error);
      return "Sorry, I couldn't generate a response at this time.";
    }
  };
  
  useEffect(() => {
    if (!currentDeviceId) return;
    
    const checkDeviceStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('device_accounts')
          .select('status')
          .eq('id', currentDeviceId)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data && data.status !== 'connected') {
          toast({
            title: "Device disconnected",
            description: "The selected WhatsApp device is not connected. Please reconnect it to continue messaging.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking device status:", error);
      }
    };
    
    checkDeviceStatus();
    
    const channel = supabase
      .channel('device-status')
      .on('postgres_changes', 
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'device_accounts',
          filter: `id=eq.${currentDeviceId}`
        },
        (payload) => {
          const status = payload.new?.status;
          if (status === 'disconnected') {
            toast({
              title: "Device disconnected",
              description: "Your WhatsApp device has been disconnected. Please reconnect it to continue messaging.",
              variant: "destructive",
            });
          } else if (status === 'connected') {
            toast({
              title: "Device connected",
              description: "Your WhatsApp device is now connected.",
            });
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentDeviceId]);
  
  const changeWallpaper = (wallpaperUrl: string | null) => {
    setWallpaper(wallpaperUrl);
  };
  
  const toggleContactStarStatus = (contactId: string) => {
    toggleContactStar(contactId);
  };
  
  const toggleContactMute = (contactId: string, isMuted: boolean) => {
    muteContact(contactId, isMuted);
    if (isMuted) {
      setSoundEnabled(false);
    }
  };
  
  const toggleDisappearingMessages = (enabled: boolean) => {
    setDisappearingMessages(prev => ({
      ...prev,
      enabled
    }));
  };
  
  const setDisappearingTimeout = (hours: number) => {
    setDisappearingMessages(prev => ({
      ...prev,
      timeout: hours
    }));
  };

  return (
    <div className="flex gap-3 overflow-hidden h-full">
      <ContactSidebar />
      
      <div className="flex-1 flex rounded-lg overflow-hidden bg-card shadow-sm">
        {selectedContact ? (
          <MessagePanel 
            contact={selectedContact} 
            deviceId={currentDeviceId}
            wallpaper={wallpaper}
            soundEnabled={soundEnabled}
            disappearingMessages={disappearingMessages}
            onClearChat={clearChat}
            onToggleStar={toggleContactStarStatus}
            onToggleMute={toggleContactMute}
            onToggleDisappearing={toggleDisappearingMessages}
            onSetDisappearingTimeout={setDisappearingTimeout}
          />
        ) : (
          <EmptyConversation />
        )}
      </div>
      
      {isSidebarOpen && selectedContact && (
        <ContactInfoPanel 
          contact={selectedContact} 
          onChangeWallpaper={changeWallpaper}
          onToggleStar={() => toggleContactStarStatus(selectedContact.id)}
          onToggleMute={(isMuted) => toggleContactMute(selectedContact.id, isMuted)}
          onClearChat={() => clearChat(selectedContact.id)}
          onToggleDisappearing={toggleDisappearingMessages}
          onSetDisappearingTimeout={setDisappearingTimeout}
          onBlockContact={blockContact}
        />
      )}
      
      {isAssistantActive && (
        <AIAssistantPanel 
          onRequestAIAssistance={handleRequestAIAssistance}
          onClose={() => toggleAssistant()}
        />
      )}
    </div>
  );
};

export default ConversationLayout;
