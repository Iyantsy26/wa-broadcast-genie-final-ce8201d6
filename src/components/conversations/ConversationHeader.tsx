
import React from 'react';
import { Contact, Conversation } from '@/types/conversation';

interface ConversationHeaderProps {
  contact: Contact;
  onInfoClick: () => void;
  deviceId: string;
  conversation?: Conversation;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ 
  contact,
  onInfoClick,
  deviceId,
  conversation
}) => {
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
          onClick={onInfoClick}
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
              {contact.isOnline ? 'Online' : 'Offline'} • Device #{deviceId}
            </span>
          </div>
        </div>
      </div>
      <div>
        <button 
          className="p-2 hover:bg-gray-100 rounded-full"
          onClick={onInfoClick}
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
