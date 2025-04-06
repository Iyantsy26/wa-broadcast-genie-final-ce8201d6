
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Paperclip,
  Smile,
  Send,
  Mic,
  Image as ImageIcon,
  FileText,
  Film,
  MapPin,
  X,
  StopCircle,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Message, MessageType } from '@/types/conversation';

// Removed dependency on @emoji-mart/data and @emoji-mart/react

interface MessageInputBarProps {
  replyTo: Message | null;
  onCancelReply: () => void;
  onSendMessage: (content: string, type?: MessageType, mediaUrl?: string) => Promise<void>;
  onSendVoiceMessage: (durationSeconds: number) => Promise<void>;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({
  replyTo,
  onCancelReply,
  onSendMessage,
  onSendVoiceMessage
}) => {
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<{
    type: 'image' | 'document' | 'video';
    file: File;
    previewUrl?: string;
  } | null>(null);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auto resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };
  
  // Handle attachment selection
  const handleAttachment = (type: 'image' | 'document' | 'video') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 
        type === 'image' ? 'image/*' : 
        type === 'video' ? 'video/*' : 
        type === 'document' ? '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv' : 
        '*/*';
      
      fileInputRef.current.click();
      
      // Store the type for when the file is selected
      fileInputRef.current.dataset.type = type;
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const type = e.target.dataset.type as 'image' | 'document' | 'video';
    
    // Create preview URL for images and videos
    let previewUrl;
    if (type === 'image' || type === 'video') {
      previewUrl = URL.createObjectURL(file);
    }
    
    setAttachmentPreview({
      type,
      file,
      previewUrl
    });
    
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };
  
  // Handle emoji selection - simplified to just insert common emojis
  const handleEmojiSelect = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle message sending
  const handleSendMessage = () => {
    if ((!messageText.trim() && !attachmentPreview) || isRecording) return;
    
    if (attachmentPreview) {
      const messageType = attachmentPreview.type === 'image' ? 'image' : 
                          attachmentPreview.type === 'video' ? 'video' : 'document';
      
      // In a real app, we would upload the file and get a URL
      // Here we'll just use the preview URL or a dummy URL
      const dummyUrl = attachmentPreview.previewUrl || `/uploads/${Date.now()}-${attachmentPreview.file.name}`;
      
      onSendMessage(messageText, messageType, dummyUrl)
        .then(() => {
          setMessageText('');
          setAttachmentPreview(null);
          if (inputRef.current) {
            inputRef.current.style.height = 'auto';
          }
        });
    } else {
      onSendMessage(messageText)
        .then(() => {
          setMessageText('');
          if (inputRef.current) {
            inputRef.current.style.height = 'auto';
          }
        });
    }
  };
  
  // Handle voice recording
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // Start timer
    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    setRecordingInterval(interval);
    
    // In a real app, we would start recording audio here
  };
  
  const stopRecording = () => {
    if (recordingInterval) {
      clearInterval(recordingInterval);
    }
    
    const duration = recordingTime;
    setIsRecording(false);
    setRecordingTime(0);
    
    // In a real app, we would stop recording and get the audio file
    // For now, we'll just simulate sending a voice message
    onSendVoiceMessage(duration);
  };
  
  // Format recording time
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Render reply preview
  const renderReplyPreview = () => {
    if (!replyTo) return null;
    
    let previewContent = replyTo.content;
    const messageType = replyTo.type;
    
    if (messageType === 'image') {
      previewContent = '📷 Image';
    } else if (messageType === 'video') {
      previewContent = '🎥 Video';
    } else if (messageType === 'document') {
      previewContent = '📎 Document';
    } else if (messageType === 'voice') {
      previewContent = '🎤 Voice message';
    }
    
    return (
      <div className="p-2 bg-muted/60 rounded-md flex items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center">
            <span className="text-xs font-medium mr-2">
              Replying to {replyTo.isOutbound ? 'yourself' : replyTo.sender}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {previewContent}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0" 
          onClick={onCancelReply}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  // Simple emoji picker for a few common emojis
  const simpleEmojiPicker = (
    <div className="p-2 grid grid-cols-6 gap-1">
      {['😊', '👍', '❤️', '😂', '🎉', '👏', '🙏', '💯', '🔥', '😍', '🤔', '👌'].map(emoji => (
        <button
          key={emoji}
          className="text-lg hover:bg-muted rounded p-1"
          onClick={() => handleEmojiSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
  
  return (
    <div className="bg-card border-t p-3 space-y-2">
      {/* Reply preview */}
      {renderReplyPreview()}
      
      {/* Attachment preview */}
      {attachmentPreview && (
        <div className="p-2 bg-muted/60 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {attachmentPreview.type === 'image' ? 'Image' : 
               attachmentPreview.type === 'video' ? 'Video' : 
               'Document'}: {attachmentPreview.file.name}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => setAttachmentPreview(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {attachmentPreview.type === 'image' && attachmentPreview.previewUrl && (
            <img 
              src={attachmentPreview.previewUrl} 
              alt="Preview" 
              className="h-32 object-cover rounded-md mx-auto"
            />
          )}
          
          {attachmentPreview.type === 'video' && attachmentPreview.previewUrl && (
            <video 
              src={attachmentPreview.previewUrl} 
              className="h-32 mx-auto rounded-md" 
              controls
            />
          )}
          
          {attachmentPreview.type === 'document' && (
            <div className="flex items-center p-2 bg-background rounded-md">
              <FileText className="h-10 w-10 text-primary mr-3" />
              <div>
                <div className="text-sm font-medium">{attachmentPreview.file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(attachmentPreview.file.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Voice recording UI */}
      {isRecording ? (
        <div className="flex items-center justify-between bg-destructive/10 rounded-md p-3">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-destructive animate-pulse"></div>
            <span className="text-sm font-medium">Recording... {formatRecordingTime(recordingTime)}</span>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={stopRecording}
          >
            <StopCircle className="h-4 w-4 mr-1" />
            Stop
          </Button>
        </div>
      ) : (
        /* Message input */
        <div className="flex items-center gap-2">
          {/* Attachment button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Paperclip className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-auto p-2">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-col h-16 w-16 py-1"
                  onClick={() => handleAttachment('image')}
                >
                  <ImageIcon className="h-6 w-6 mb-1" />
                  <span className="text-xs">Image</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-col h-16 w-16 py-1"
                  onClick={() => handleAttachment('document')}
                >
                  <FileText className="h-6 w-6 mb-1" />
                  <span className="text-xs">Document</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-col h-16 w-16 py-1"
                  onClick={() => handleAttachment('video')}
                >
                  <Film className="h-6 w-6 mb-1" />
                  <span className="text-xs">Video</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-col h-16 w-16 py-1"
                >
                  <MapPin className="h-6 w-6 mb-1" />
                  <span className="text-xs">Location</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Hidden file input */}
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          
          {/* Simple emoji picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-auto p-0 border-0">
              {simpleEmojiPicker}
            </PopoverContent>
          </Popover>
          
          {/* Message input */}
          <Textarea 
            ref={inputRef}
            placeholder="Type a message..."
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            value={messageText}
            onChange={handleTextareaChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isRecording}
          />
          
          {/* Send/Record button */}
          {messageText.trim() || attachmentPreview ? (
            <Button onClick={handleSendMessage} className="h-10 w-10">
              <Send className="h-5 w-5" />
            </Button>
          ) : (
            <Button 
              variant="secondary" 
              className="h-10 w-10"
              onClick={startRecording}
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageInputBar;
