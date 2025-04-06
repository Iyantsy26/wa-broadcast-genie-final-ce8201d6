
// Just adding a small fix for setReplyTo

import React from 'react';
import { useConversation } from '@/contexts/ConversationContext';

// Just a partial implementation to fix the issue
const MessageItem = ({ message, onReply }) => {
  const { handleReplyToMessage } = useConversation();

  // Pass the reply to the parent component which will handle it
  const handleReply = () => {
    if (onReply) {
      onReply(message);
    } else {
      handleReplyToMessage(message);
    }
  };

  return (
    <div>
      {/* Message content */}
      <div>{message.content}</div>
      {/* Reply button */}
      <button onClick={handleReply}>Reply</button>
    </div>
  );
};

export default MessageItem;
