
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Lock, X } from 'lucide-react';
import { Message } from '@/types/conversation';

// Import our new components
import EmojiPicker from '../conversations/inputs/EmojiPicker';
import FileUploader from '../conversations/inputs/FileUploader';
import VoiceRecorder from '../conversations/inputs/VoiceRecorder';
import FilePreview from '../conversations/inputs/FilePreview';

interface MessageInputProps {
  onSendMessage: (content: string, file: File | null) => void;
  onVoiceMessageSent: (durationInSeconds: number) => void;
  isEncrypted?: boolean;
  replyTo: Message | null;
  onCancelReply: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  onVoiceMessageSent, 
  isEncrypted,
  replyTo,
  onCancelReply,
}) => {
  const [messageInput, setMessageInput] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [activeAttachmentType, setActiveAttachmentType] = useState<string | null>(null);
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

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    
    // Reset height to auto to properly calculate the new height
    e.target.style.height = 'auto';
    // Set the height to scrollHeight to fit the content
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="p-3 border-t">
      {/* Reply preview */}
      {replyTo && (
        <div className="mb-2 p-2 bg-muted/40 rounded-md flex items-start">
          <div className="flex-1">
            <div className="flex items-center">
              <span className="text-xs font-medium mr-2">
                Replying to {replyTo.isOutbound ? replyTo.sender : 'Contact'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {replyTo.content || (replyTo.type === 'image' ? 'Image' : 
                                 replyTo.type === 'video' ? 'Video' : 
                                 replyTo.type === 'document' ? 'Document' : 
                                 replyTo.type === 'voice' ? 'Voice message' : 'Message')}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6" 
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <FileUploader 
          onFileSelect={handleFileSelect}
          activeAttachmentType={activeAttachmentType}
          setActiveAttachmentType={setActiveAttachmentType}
        />
        
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        
        <Textarea
          ref={textareaRef}
          placeholder={isEncrypted ? "Type a secure message..." : "Type a message..."}
          className="min-h-[44px] max-h-[120px] flex-1"
          value={messageInput}
          onChange={handleTextareaChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isRecording}
          rows={1}
        />
        
        {isEncrypted && (
          <Lock className="h-4 w-4 text-green-600 mx-1" aria-label="End-to-end encrypted" />
        )}
        
        <VoiceRecorder 
          onRecordingComplete={handleVoiceRecordingComplete}
          disabled={false}
        />
        
        <Button 
          size="icon" 
          onClick={handleSendMessage}
          disabled={(!messageInput.trim() && !selectedFile) || isRecording}
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

export default MessageInput;
