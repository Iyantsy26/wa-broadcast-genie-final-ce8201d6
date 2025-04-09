
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile, Mic, X } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  SUPPORTED_IMAGE_TYPES, 
  SUPPORTED_VIDEO_TYPES, 
  SUPPORTED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_DOCUMENT_SIZE,
  validateFile 
} from '@/utils/fileUpload';

interface InputBarProps {
  onSendMessage: (content: string, file?: File | null) => void;
  onStartRecording?: () => void;
  onStopRecording?: (audioBlobUrl: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function InputBar({ 
  onSendMessage, 
  onStartRecording,
  onStopRecording,
  disabled = false,
  placeholder = "Type a message..."
}: InputBarProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePopoverOpen, setFilePopoverOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const handleSend = () => {
    if (message.trim() || file) {
      onSendMessage(message, file);
      setMessage('');
      setFile(null);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setFilePopoverOpen(false);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        if (validateFile(selectedFile, SUPPORTED_IMAGE_TYPES, MAX_IMAGE_SIZE)) {
          setFile(selectedFile);
        }
      } else if (selectedFile.type.startsWith('video/')) {
        if (validateFile(selectedFile, SUPPORTED_VIDEO_TYPES, MAX_VIDEO_SIZE)) {
          setFile(selectedFile);
        }
      } else {
        if (validateFile(selectedFile, SUPPORTED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE)) {
          setFile(selectedFile);
        }
      }
    }
    setFilePopoverOpen(false);
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        const audioBlobUrl = URL.createObjectURL(audioBlob);
        
        if (onStopRecording) {
          onStopRecording(audioBlobUrl);
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      if (onStartRecording) {
        onStartRecording();
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  return (
    <div className="px-3 py-2 bg-white border-t">
      {file && (
        <div className="mb-2 px-3 py-2 bg-gray-100 rounded-md flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium truncate max-w-[150px]">
              {file.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(1)} MB
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFile(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {isRecording ? (
        <div className="flex items-center justify-between bg-red-50 p-2 rounded-md">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-sm">Recording audio...</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={stopRecording}
          >
            Stop
          </Button>
        </div>
      ) : (
        <div className="flex space-x-2">
          <Popover open={filePopoverOpen} onOpenChange={setFilePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" disabled={disabled}>
                <Paperclip className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-56 p-2">
              <div className="space-y-1">
                <label className="block w-full">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    Photo
                  </Button>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                
                <label className="block w-full">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    Video
                  </Button>
                  <input
                    type="file"
                    id="video-upload"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                
                <label className="block w-full">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => document.getElementById('document-upload')?.click()}
                  >
                    Document
                  </Button>
                  <input
                    type="file"
                    id="document-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </PopoverContent>
          </Popover>
          
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[40px] max-h-[120px] resize-none py-2 pr-8"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-1 bottom-1"
                  disabled={disabled}
                >
                  <Smile className="h-5 w-5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-80">
                {/* Emoji picker would go here */}
                <div className="p-4 h-[300px] overflow-auto">
                  <p className="text-sm text-center text-muted-foreground">
                    Emoji picker placeholder
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={!isRecording ? startRecording : stopRecording}
            disabled={disabled || Boolean(message.trim() || file)}
            className={isRecording ? "text-red-500" : undefined}
          >
            <Mic className="h-5 w-5" />
          </Button>
          
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={disabled || (!message.trim() && !file)}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
