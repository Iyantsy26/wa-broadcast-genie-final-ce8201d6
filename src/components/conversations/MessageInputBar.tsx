
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, X, MapPin } from 'lucide-react';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { Message } from '@/types/conversation';
import FileUploader from './inputs/FileUploader';
import FilePreview from './inputs/FilePreview';
import ReplyPreview from './inputs/ReplyPreview';

interface MessageInputBarProps {
  replyTo: Message | null;
  onCancelReply: () => void;
  onSendMessage: (content: string) => void;
  onSendVoiceMessage: (durationInSeconds: number) => void;
  deviceId: string;
  onFileSelect?: (file: File) => void;
  selectedFile?: File | null;
  onRemoveFile?: () => void;
  activeAttachmentType?: string | null;
  setActiveAttachmentType?: (type: string | null) => void;
  onShareLocation?: () => void;
  soundEnabled?: boolean;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({
  replyTo,
  onCancelReply,
  onSendMessage,
  onSendVoiceMessage,
  deviceId,
  onFileSelect,
  selectedFile,
  onRemoveFile,
  activeAttachmentType,
  setActiveAttachmentType,
  onShareLocation,
  soundEnabled = true
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingIntervalRef = useRef<number>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const handleSendMessage = () => {
    if (message.trim() || selectedFile) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Play send sound if enabled
      if (soundEnabled) {
        const audio = new Audio('/sounds/send-message.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.error('Error playing sound:', e));
      }
      
      // Focus back to textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const handleFileSelect = (file: File) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current);
        const recordingDuration = Math.round(recordingTime);
        // In a real app, you would upload this blob to a server and get a URL
        console.log('Recording stopped, duration:', recordingDuration);
        
        // Send voice message with duration
        onSendVoiceMessage(recordingDuration);
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start recording timer
      const startTime = Date.now();
      recordingIntervalRef.current = window.setInterval(() => {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        setRecordingTime(elapsedSeconds);
      }, 100);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      setRecordingTime(0);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const formatRecordingTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="px-4 py-3 bg-white border-t">
      {/* Reply preview */}
      {replyTo && (
        <ReplyPreview replyTo={replyTo} onCancelReply={onCancelReply} />
      )}
      
      {/* File preview */}
      {selectedFile && onRemoveFile && (
        <FilePreview 
          file={selectedFile} 
          type={activeAttachmentType} 
          onRemove={onRemoveFile} 
        />
      )}
      
      {/* Voice recording UI */}
      {isRecording ? (
        <div className="p-3 mb-2 bg-red-50 border border-red-200 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <span>{formatRecordingTime(recordingTime)}</span>
          </div>
          <Button variant="outline" size="sm" onClick={stopRecording}>
            <X className="h-4 w-4 mr-2" /> Cancel Recording
          </Button>
        </div>
      ) : null}
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            className="min-h-[40px] max-h-[120px] px-4 py-2 resize-none pr-10"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isRecording}
          />
          <div className="absolute right-2 bottom-2">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </div>
        </div>
        
        <div className="flex space-x-1">
          {onFileSelect && setActiveAttachmentType && (
            <FileUploader 
              onFileSelect={handleFileSelect} 
              activeAttachmentType={activeAttachmentType || null}
              setActiveAttachmentType={setActiveAttachmentType}
            />
          )}
          
          {onShareLocation && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onShareLocation}
              disabled={isRecording}
            >
              <MapPin className="h-5 w-5" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRecording}
            disabled={Boolean(message.trim() || selectedFile)}
            className={isRecording ? "text-red-500" : ""}
          >
            <Mic className="h-5 w-5" />
          </Button>
          
          <Button 
            onClick={handleSendMessage} 
            disabled={(!message.trim() && !selectedFile) || isRecording}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInputBar;
