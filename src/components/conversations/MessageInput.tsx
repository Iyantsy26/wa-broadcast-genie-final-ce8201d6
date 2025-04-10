
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from 'lucide-react';
import { Message } from '@/types/conversation';

// Import our components
import EmojiPicker from './inputs/EmojiPicker';
import FileUploader from './inputs/FileUploader';
import VoiceRecorder from './inputs/VoiceRecorder';
import FilePreview from './inputs/FilePreview';
import ReplyPreview from './inputs/ReplyPreview';
import AIResponseGenerator from './inputs/AIResponseGenerator';
import AIResponseLoader from './inputs/AIResponseLoader';

interface MessageInputProps {
  onSendMessage: (content: string, file: File | null) => void;
  onVoiceMessageSent?: (durationInSeconds: number) => void;
  onRequestAIAssistance?: (prompt: string) => Promise<string>;
  replyTo?: Message | null;
  onCancelReply?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage,
  onVoiceMessageSent,
  onRequestAIAssistance,
  replyTo,
  onCancelReply
}) => {
  const [messageInput, setMessageInput] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [activeAttachmentType, setActiveAttachmentType] = useState<string | null>(null);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    // Auto focus to text area after file selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setShowFilePreview(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
  };

  useEffect(() => {
    // Focus textarea when component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="bg-white border-t px-4 pt-2 pb-3 space-y-2">
      {/* Reply Preview */}
      {replyTo && onCancelReply && (
        <ReplyPreview message={replyTo} onCancelReply={onCancelReply} />
      )}
      
      {/* File Preview */}
      {showFilePreview && selectedFile && (
        <FilePreview file={selectedFile} onClear={clearSelectedFile} />
      )}
      
      {/* AI Response Generator */}
      {onRequestAIAssistance && (
        <AIResponseGenerator
          isActive={isGeneratingResponse}
          setIsActive={setIsGeneratingResponse}
          onRequestAIAssistance={onRequestAIAssistance}
          onResponseGenerated={(response) => {
            setMessageInput(response);
          }}
        />
      )}
      
      {/* Message Input Area */}
      <div className="flex items-end gap-2">
        <div className="flex-grow relative rounded-md border overflow-hidden">
          {isGeneratingResponse && <AIResponseLoader />}
          
          <Textarea
            ref={textareaRef}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[120px] py-3 resize-none pr-[90px]"
            disabled={isRecording || isGeneratingResponse}
          />
          
          <div className="absolute right-1 bottom-1 flex items-center">
            {/* Emoji Picker */}
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            
            {/* File Uploader */}
            <FileUploader 
              onFileSelect={handleFileSelect}
              activeAttachmentType={activeAttachmentType} 
              setActiveAttachmentType={setActiveAttachmentType}
            />
            
            {/* Voice Recorder */}
            {onVoiceMessageSent && (
              <VoiceRecorder 
                isRecording={isRecording}
                setIsRecording={setIsRecording}
                onVoiceMessageReady={onVoiceMessageSent}
              />
            )}
          </div>
        </div>
        
        <Button 
          className="shrink-0" 
          size="icon" 
          onClick={handleSendMessage}
          disabled={(!messageInput.trim() && !selectedFile) || isRecording}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
