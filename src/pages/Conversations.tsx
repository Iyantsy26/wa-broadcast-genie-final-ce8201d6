
import React from 'react';
import { ConversationProvider } from '@/contexts/ConversationContext';
import ConversationLayout from '@/components/conversations/ConversationLayout';

const Conversations = () => {
  return (
    <ConversationProvider>
      <ConversationLayout />
    </ConversationProvider>
  );
};

export default Conversations;
