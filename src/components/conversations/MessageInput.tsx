
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from 'lucide-react';
import { Message } from '@/types/conversation';

// Import our new components
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
      textareaRef.current?.focus();
    }, 100);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleVoiceRecordingComplete = (durationInSeconds: number) => {
    setIsRecording(false);
    if (onVoiceMessageSent) {
      onVoiceMessageSent(durationInSeconds);
    }
  };

  const handleAIAssist = async () => {
    if (!onRequestAIAssistance || !messageInput.trim()) return;
    
    setIsGeneratingResponse(true);
    try {
      const prompt = `Help me professionally respond to: "${messageInput}"`;
      const response = await onRequestAIAssistance(prompt);
      setMessageInput(response);
    } catch (error) {
      console.error('Error getting AI assistance:', error);
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  return (
    <div className="p-3 border-t">
      <ReplyPreview 
        replyTo={replyTo || null} 
        onCancelReply={onCancelReply || (() => {})} 
      />
      
      <div className="flex items-center gap-2">
        <FileUploader 
          onFileSelect={handleFileSelect}
          activeAttachmentType={activeAttachmentType}
          setActiveAttachmentType={setActiveAttachmentType}
        />
        
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        
        <Textarea
          ref={textareaRef}
          placeholder="Type a message..."
          className="min-h-[44px] max-h-[120px] resize-none"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isRecording || isGeneratingResponse}
        />
        
        {onRequestAIAssistance && messageInput.trim() && (
          <AIResponseGenerator 
            onGenerateResponse={handleAIAssist}
            disabled={isRecording}
            isGenerating={isGeneratingResponse}
          />
        )}
        
        <VoiceRecorder 
          onRecordingComplete={handleVoiceRecordingComplete}
          disabled={isGeneratingResponse}
        />
        
        <Button 
          size="icon" 
          onClick={handleSendMessage}
          disabled={(!messageInput.trim() && !selectedFile) || isRecording || isGeneratingResponse}
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
      
      {isGeneratingResponse && <AIResponseLoader />}
    </div>
  );
};

export default MessageInput;
