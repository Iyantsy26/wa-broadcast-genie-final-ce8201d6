
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Paperclip, Send, Mic, MapPin, X } from 'lucide-react';
import FileUploader from './inputs/FileUploader';
import VoiceRecorder from './inputs/VoiceRecorder';
import EmojiPicker from './inputs/EmojiPicker';
import ReplyPreview from './inputs/ReplyPreview';
import CannedResponseSelector from './CannedResponseSelector';
import AIResponseGenerator from './inputs/AIResponseGenerator';
import { Message } from '@/types/conversation';
import FilePreview from './inputs/FilePreview';

interface MessageInputBarProps {
  onSendMessage: (content: string, file: File | null) => void;
  onSendVoiceMessage: (durationInSeconds: number) => void;
  onReply?: (message: Message) => void;
  onCancelReply: () => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onLocationShare?: () => void;
  deviceId: string;
  replyTo?: Message | null;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({
  onSendMessage,
  onSendVoiceMessage,
  onReply,
  onCancelReply,
  onLocationShare,
  deviceId,
  replyTo
}) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [aiAssistanceActive, setAIAssistanceActive] = useState(false);
  const [showCannedResponses, setShowCannedResponses] = useState(false);
  const [activeAttachmentType, setActiveAttachmentType] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleAIAssistanceToggle = () => {
    setAIAssistanceActive(!aiAssistanceActive);
  };

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setShowFileUploader(false);
  };

  const handleSendMessage = () => {
    if ((message.trim() || selectedFile) && !isRecording) {
      onSendMessage(message, selectedFile);
      setMessage('');
      setSelectedFile(null);
      textAreaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textAreaRef.current?.focus();
  };

  const handleLocationShare = () => {
    if (onLocationShare) {
      onLocationShare();
    } else {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          position => {
            console.log(`Lat: ${position.coords.latitude}, Long: ${position.coords.longitude}`);
            // Handle location sharing
          },
          error => {
            console.error('Error getting location:', error);
          }
        );
      }
    }
  };
  
  const handleUseCannedResponse = (responseText: string) => {
    setMessage(responseText);
    setShowCannedResponses(false);
    textAreaRef.current?.focus();
  };
  
  const handleAIResponseGenerated = (response: string) => {
    setMessage(response);
    setAIAssistanceActive(false);
    textAreaRef.current?.focus();
  };

  return (
    <div className="bg-background border-t p-3 space-y-2">
      {/* Reply preview is visible when replying to a message */}
      <ReplyPreview replyTo={replyTo || null} onCancelReply={onCancelReply} />
      
      {/* AI assistance panel */}
      {aiAssistanceActive && (
        <AIResponseGenerator
          currentMessage={message}
          onResponseGenerated={handleAIResponseGenerated}
          onClose={() => setAIAssistanceActive(false)}
        />
      )}
      
      {/* File preview */}
      {selectedFile && (
        <FilePreview
          file={selectedFile}
          type={activeAttachmentType}
          onRemove={() => setSelectedFile(null)}
        />
      )}
      
      {/* Voice recorder UI */}
      {isRecording && (
        <VoiceRecorder
          onRecordingComplete={onSendVoiceMessage}
          disabled={false}
        />
      )}
      
      {/* File uploader UI */}
      {showFileUploader && (
        <FileUploader
          onFileSelect={handleFileChange}
          activeAttachmentType={activeAttachmentType}
          setActiveAttachmentType={setActiveAttachmentType}
        />
      )}
      
      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-0">
          <EmojiPicker onEmojiSelect={handleInsertEmoji} />
        </div>
      )}
      
      {/* Canned responses */}
      {showCannedResponses && (
        <CannedResponseSelector
          onSelectResponse={handleUseCannedResponse}
          onClose={() => setShowCannedResponses(false)}
        />
      )}
      
      <div className="flex items-end gap-2">
        <div className="flex space-x-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShowFileUploader(true)}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setIsRecording(true)}
          >
            <Mic className="h-5 w-5" />
          </Button>
          
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleLocationShare}
          >
            <MapPin className="h-5 w-5" />
          </Button>
          
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5" />
          </Button>
        </div>

        <Textarea
          ref={textAreaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="resize-none min-h-[40px] max-h-32"
          rows={1}
        />

        <div className="flex space-x-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShowCannedResponses(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 10c0 3.976-7 13-7 13S5 13.976 5 10c0-3.866 3.134-7 7-7s7 3.134 7 7Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </Button>
          
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleAIAssistanceToggle}
            className={aiAssistanceActive ? "text-primary" : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a5 5 0 0 0-2.5 9.33v4.67h5V11.33A5 5 0 0 0 12 2Z" />
              <path d="M9.5 16v4h5v-4" />
              <path d="M5.5 13a3.5 3.5 0 0 0 3.5 3.5" />
              <path d="M15 16.5a3.5 3.5 0 0 0 3.5-3.5" />
              <path d="M9.5 21h5" />
            </svg>
          </Button>
          
          <Button
            type="button"
            onClick={handleSendMessage}
            disabled={!message.trim() && !selectedFile}
            className="rounded-full"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInputBar;
