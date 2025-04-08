
import React from 'react';
import { Contact, Conversation } from '@/types/conversation';
import { DeviceAccount } from '@/services/deviceService';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ConversationHeaderProps {
  contact: Contact;
  onInfoClick: () => void;
  deviceId: string;
  conversation?: Conversation;
  onOpenContactInfo?: () => void;
  onToggleStar?: () => void;
  onToggleMute?: (isMuted: boolean) => void;
  onClearChat?: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ 
  contact,
  onInfoClick,
  deviceId,
  conversation,
  onOpenContactInfo,
  onToggleStar,
  onToggleMute,
  onClearChat
}) => {
  const [deviceName, setDeviceName] = useState<string>(`Device #${deviceId}`);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDeviceInfo() {
      if (!deviceId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('device_accounts')
          .select('name')
          .eq('id', deviceId)
          .single();
        
        if (error) {
          console.error('Error fetching device info:', error);
          return;
        }
        
        if (data) {
          setDeviceName(data.name);
        }
      } catch (error) {
        console.error('Error in fetchDeviceInfo:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDeviceInfo();
  }, [deviceId]);

  const getStatusIndicator = (isOnline?: boolean) => {
    return (
      <div 
        className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
      ></div>
    );
  };

  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer" 
          onClick={onInfoClick || onOpenContactInfo} 
        >
          {contact.avatar ? (
            <img 
              src={contact.avatar} 
              alt={contact.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-semibold">
              {contact.name.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h2 className="font-semibold">{contact.name}</h2>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            {getStatusIndicator(contact.isOnline)}
            <span>
              {contact.isOnline ? 'Online' : 'Offline'} • 
              {loading ? (
                <span className="ml-1 inline-flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" /> 
                  Loading device...
                </span>
              ) : (
                <span> {deviceName}</span>
              )}
            </span>
          </div>
        </div>
      </div>
      <div>
        <button 
          className="p-2 hover:bg-gray-100 rounded-full"
          onClick={onInfoClick || onOpenContactInfo}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ConversationHeader;
