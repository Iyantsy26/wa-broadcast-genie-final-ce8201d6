
import React from 'react';
import { Conversation, Message } from '@/types/conversation';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface MessagePanelProps {
  conversation: Conversation;
  messages: Message[];
  isTyping: boolean;
  onOpenContactInfo: () => void;
  onSendMessage: (content: string, file: File | null, replyToMessageId?: string) => void;
  onVoiceMessageSent: (durationInSeconds: number) => void;
  onReaction: (messageId: string, emoji: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessagePanel: React.FC<MessagePanelProps> = ({
  conversation,
  messages,
  isTyping,
  onOpenContactInfo,
  onSendMessage,
  onVoiceMessageSent,
  onReaction,
  messagesEndRef
}) => {
  const [replyTo, setReplyTo] = React.useState<Message | null>(null);
  
  const handleSendMessage = (content: string, file: File | null) => {
    onSendMessage(content, file, replyTo?.id);
    setReplyTo(null);
  };
  
  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden">
      <ChatHeader 
        conversation={conversation}
        onOpenContactInfo={onOpenContactInfo}
      />
      
      <MessageList 
        messages={messages}
        contactName={conversation.contact.name}
        isTyping={isTyping}
        onReaction={onReaction}
        onReply={setReplyTo}
        messagesEndRef={messagesEndRef}
      />
      
      <MessageInput 
        onSendMessage={handleSendMessage}
        onVoiceMessageSent={onVoiceMessageSent}
        isEncrypted={conversation.isEncrypted}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
};

export default MessagePanel;
