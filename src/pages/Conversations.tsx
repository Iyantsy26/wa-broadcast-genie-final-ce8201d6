
import React from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import ChatPage from '@/components/chat/ChatPage';

const Conversations = () => {
  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );
};

export default Conversations;
