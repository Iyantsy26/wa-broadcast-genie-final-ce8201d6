
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from 'lucide-react';
import { Message } from '@/types/conversation';
import EmojiPicker from './inputs/EmojiPicker';
import FileUploader from './inputs/FileUploader';
import VoiceRecorder from './inputs/VoiceRecorder';
import FilePreview from './inputs/FilePreview';
import ReplyPreview from './inputs/ReplyPreview';

interface MessageInputBarProps {
  replyTo?: Message | null;
  onCancelReply: () => void;
  onSendMessage: (content: string, file: File | null) => void;
  onSendVoiceMessage: (durationInSeconds: number) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  onLocationShare?: () => void;
  deviceId: string;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({
  replyTo,
  onCancelReply,
  onSendMessage,
  onSendVoiceMessage,
  onLocationShare,
  deviceId
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [activeAttachmentType, setActiveAttachmentType] = useState<string | null>(null);

  const handleSendMessage = () => {
    if (messageInput.trim() || selectedFile) {
      onSendMessage(messageInput, selectedFile);
      setMessageInput('');
      setSelectedFile(null);
      setShowFilePreview(false);
      setActiveAttachmentType(null);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setShowFilePreview(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-3 border-t">
      {replyTo && (
        <ReplyPreview 
          replyTo={replyTo} 
          onCancelReply={onCancelReply} 
        />
      )}
      
      <div className="flex items-center gap-2">
        <FileUploader 
          onFileSelect={handleFileSelect}
          onLocationShare={onLocationShare}
          activeAttachmentType={activeAttachmentType}
          setActiveAttachmentType={setActiveAttachmentType}
        />
        
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        
        <Textarea
          placeholder="Type a message..."
          className="min-h-[40px] max-h-[120px] flex-1 resize-none"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyPress}
          rows={1}
        />
        
        <VoiceRecorder 
          onRecordingComplete={onSendVoiceMessage}
          disabled={false}
        />
        
        <Button 
          size="icon" 
          onClick={handleSendMessage}
          disabled={!messageInput.trim() && !selectedFile}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {selectedFile && showFilePreview && (
        <FilePreview 
          file={selectedFile}
          type={activeAttachmentType}
          onRemove={() => {
            setSelectedFile(null);
            setShowFilePreview(false);
          }}
        />
      )}
    </div>
  );
};

export default MessageInputBar;
