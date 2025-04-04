
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Paperclip, 
  Send, 
  Mic, 
  StopCircle, 
  Smile,
  Image, 
  Video, 
  FileText,
  MessageSquareDiff,
  X
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Message } from '@/types/conversation';

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
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [activeAttachmentType, setActiveAttachmentType] = useState<string | null>(null);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Expanded emoji selection
  const emojis = [
    '😀', '😂', '😊', '😍', '🥰', '😘', '😎', '👍', '🙏', '❤️', 
    '🔥', '⭐', '🎉', '✅', '🤔', '👏', '🌟', '💯', '🤣', '😢',
    '👌', '🙌', '💪', '🤝', '😉', '🥳', '😇', '💭', '💬', '🚀'
  ];

  const handleSendMessage = () => {
    if (messageInput.trim() || selectedFile) {
      onSendMessage(messageInput, selectedFile);
      setMessageInput('');
      setSelectedFile(null);
      setShowFilePreview(false);
      setActiveAttachmentType(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowFilePreview(true);
    }
  };

  const initiateFileUpload = (type: string) => {
    setActiveAttachmentType(type);
    if (fileInputRef.current) {
      switch (type) {
        case 'image':
          fileInputRef.current.accept = 'image/*';
          break;
        case 'video':
          fileInputRef.current.accept = 'video/*';
          break;
        case 'document':
          fileInputRef.current.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
          break;
      }
      fileInputRef.current.click();
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      if (onVoiceMessageSent) {
        onVoiceMessageSent(recordingTime);
      }
      
      setRecordingTime(0);
    } else {
      toast({
        title: "Recording started",
        description: "Voice recording has started. Click the stop button when finished.",
      });
      
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    
    setIsRecording(!isRecording);
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addEmoji = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
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
      toast({
        title: "AI Assistance Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  return (
    <div className="p-3 border-t">
      {replyTo && (
        <div className="mb-2 p-2 bg-gray-100 rounded-md flex items-center justify-between">
          <div className="flex-1">
            <span className="text-xs text-muted-foreground">Replying to:</span>
            <p className="text-sm truncate">{replyTo.content}</p>
          </div>
          {onCancelReply && (
            <Button variant="ghost" size="sm" onClick={onCancelReply}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => initiateFileUpload('image')}>
              <Image className="mr-2 h-4 w-4" />
              Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => initiateFileUpload('video')}>
              <Video className="mr-2 h-4 w-4" />
              Video
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => initiateFileUpload('document')}>
              <FileText className="mr-2 h-4 w-4" />
              Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-10 gap-1">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  className="h-7 w-7 flex items-center justify-center hover:bg-gray-100 rounded"
                  onClick={() => addEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
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
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={isGeneratingResponse}
            onClick={handleAIAssist}
            title="Get AI assistance with this message"
          >
            <MessageSquareDiff className="h-5 w-5" />
          </Button>
        )}
        
        {!isRecording ? (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleVoiceRecording}
          >
            <Mic className="h-5 w-5" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="text-xs text-red-500">{formatRecordingTime(recordingTime)}</div>
            <Progress value={100} className="w-20 h-1" />
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500"
              onClick={toggleVoiceRecording}
            >
              <StopCircle className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        <Button 
          size="icon" 
          onClick={handleSendMessage}
          disabled={(!messageInput.trim() && !selectedFile) || isRecording || isGeneratingResponse}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {selectedFile && showFilePreview && (
        <div className="mt-2 p-2 bg-gray-100 rounded-md flex items-center">
          {activeAttachmentType === 'image' && (
            <img 
              src={URL.createObjectURL(selectedFile)} 
              alt="Selected file" 
              className="h-16 w-16 object-cover rounded-md mr-2"
            />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedFile(null);
              setShowFilePreview(false);
            }}
          >
            Remove
          </Button>
        </div>
      )}
      
      {isGeneratingResponse && (
        <div className="mt-2 p-2 bg-gray-100 rounded-md">
          <div className="flex items-center gap-2">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-1">
                <div className="h-2 bg-gray-300 rounded"></div>
                <div className="h-2 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">AI is writing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
