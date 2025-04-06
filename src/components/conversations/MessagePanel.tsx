
import React, { useState } from 'react';
import { Message, MessageType } from '@/types/conversation';

interface MessagePanelProps {
  messages: Message[];
  contactName: string;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (content: string, type?: MessageType, mediaUrl?: string) => Promise<void>;
  onVoiceMessageSent: (durationSeconds: number) => Promise<void>;
  onReaction?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  isEncrypted?: boolean;
}

const MessagePanel: React.FC<MessagePanelProps> = ({
  messages,
  contactName,
  isTyping,
  messagesEndRef,
  onSendMessage,
  onVoiceMessageSent,
  onReaction,
  onReply,
  replyTo,
  onCancelReply,
  isEncrypted
}) => {
  const [content, setContent] = useState('');
  
  const handleSendMessage = async () => {
    if (content.trim()) {
      await onSendMessage(content);
      setContent('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, you would upload the file to a server
    // and get a URL back, then send the message with that URL
    const fileUrl = URL.createObjectURL(file);
    
    let messageType: MessageType = 'text';
    if (file.type.startsWith('image/')) {
      messageType = 'image';
    } else if (file.type.startsWith('video/')) {
      messageType = 'video';
    } else {
      messageType = 'document';
    }
    
    await onSendMessage(file.name, messageType, fileUrl);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Message list area */}
      <div className="flex-1 overflow-y-auto">
        {/* Messages would be rendered here */}
      </div>
      
      {/* Reply indicator */}
      {replyTo && (
        <div className="p-2 border-t bg-muted/30 flex">
          <div className="flex-1">
            <div className="text-xs font-medium">
              Reply to {replyTo.isOutbound ? 'yourself' : replyTo.sender || contactName}
            </div>
            <div className="text-xs text-muted-foreground truncate">{replyTo.content}</div>
          </div>
          {onCancelReply && (
            <button 
              onClick={onCancelReply}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
      )}
      
      {/* Message input area */}
      <div className="border-t p-3 bg-background">
        <div className="flex gap-2">
          <textarea
            className="flex-1 min-h-[60px] resize-none border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={`Type a message...${isEncrypted ? ' (End-to-end encrypted)' : ''}`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex flex-col gap-2">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label 
              htmlFor="file-upload"
              className="cursor-pointer bg-muted hover:bg-muted/80 h-8 w-8 rounded-full flex items-center justify-center"
              title="Attach file"
            >
              📎
            </label>
            
            <button
              onClick={handleSendMessage}
              disabled={!content.trim()}
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                content.trim() ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
              title="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePanel;
