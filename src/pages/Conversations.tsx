
import React from 'react';
import { ConversationProvider } from '@/contexts/ConversationContext';
import ConversationPage from '@/components/conversations/ConversationPage';

const Conversations = () => {
  return (
    <ConversationProvider>
      <ConversationPage />
    </ConversationProvider>
  );
};

export default Conversations;
