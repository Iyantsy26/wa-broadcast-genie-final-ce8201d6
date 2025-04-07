
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Lock, X } from 'lucide-react';
import { Message } from '@/types/conversation';

// Import our components
import EmojiPicker from '../conversations/inputs/EmojiPicker';
import FileUploader from '../conversations/inputs/FileUploader';
import VoiceRecorder from '../conversations/inputs/VoiceRecorder';
import FilePreview from '../conversations/inputs/FilePreview';
import ReplyPreview from '../conversations/inputs/ReplyPreview';
import AIResponseGenerator from '../conversations/inputs/AIResponseGenerator';
import AIResponseLoader from '../conversations/inputs/AIResponseLoader';

interface MessageInputProps {
  onSendMessage: (content: string, file: File | null) => void;
  onVoiceMessageSent: (durationInSeconds: number) => void;
  isEncrypted?: boolean;
  replyTo: Message | null;
  onCancelReply: () => void;
  onRequestAIAssistance?: (prompt: string) => Promise<string>;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  onVoiceMessageSent, 
  isEncrypted,
  replyTo,
  onCancelReply,
  onRequestAIAssistance
}) => {
  const [messageInput, setMessageInput] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [activeAttachmentType, setActiveAttachmentType] = useState<string | null>(null);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

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
    textareaRef.current?.focus();
  };

  const handleVoiceRecordingComplete = (durationInSeconds: number) => {
    setIsRecording(false);
    onVoiceMessageSent(durationInSeconds);
  };
  
  const handleShareLocation = () => {
    // In a real app, we'd use geolocation API
    // For demo purposes, we'll send a fixed location
    const demoLatitude = 37.7749;
    const demoLongitude = -122.4194;
    
    alert(`Sharing location: ${demoLatitude}, ${demoLongitude}`);
    // Here we would call a function to send the location data
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    
    // Reset height to auto to properly calculate the new height
    e.target.style.height = 'auto';
    // Set the height to scrollHeight to fit the content
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
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
    <div className="p-3 border-t bg-white">
      <ReplyPreview 
        replyTo={replyTo} 
        onCancelReply={onCancelReply} 
      />
      
      <div className="flex items-center gap-2">
        <FileUploader 
          onFileSelect={handleFileSelect}
          onLocationShare={handleShareLocation}
          activeAttachmentType={activeAttachmentType}
          setActiveAttachmentType={setActiveAttachmentType}
        />
        
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        
        <Textarea
          ref={textareaRef}
          placeholder={isEncrypted ? "Type a secure message..." : "Type a message..."}
          className="min-h-[44px] max-h-[120px] flex-1 resize-none"
          value={messageInput}
          onChange={handleTextareaChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isRecording || isGeneratingResponse}
          rows={1}
        />
        
        {isEncrypted && (
          <Lock className="h-4 w-4 text-green-600 mx-1" aria-label="End-to-end encrypted" />
        )}
        
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
