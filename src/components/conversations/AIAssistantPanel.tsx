
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Send, Mic, Paperclip, Smile } from 'lucide-react';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import FileUploader from '@/components/conversations/inputs/FileUploader';
import FilePreview from '@/components/conversations/inputs/FilePreview';
import ReplyPreview from '@/components/conversations/inputs/ReplyPreview';
import { Message } from '@/types/conversation';

interface AIAssistantPanelProps {
  onRequestAIAssistance: (prompt: string) => Promise<string>;
  onClose: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onRequestAIAssistance, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentType, setAttachmentType] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRequestAssistance = async () => {
    if (prompt.trim()) {
      setIsLoading(true);
      try {
        await onRequestAIAssistance(prompt);
        setPrompt('');
        setSelectedFile(null);
      } catch (error) {
        console.error('Error requesting AI assistance:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleRecordingToggle = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };
  
  const handleEmojiSelect = (emoji: string) => {
    setPrompt(prev => prev + emoji);
  };
  
  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  return (
    <div className="w-80 flex flex-col bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold">AI Assistant</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <p className="text-sm text-muted-foreground mb-4">
          Get AI-powered suggestions for responding to messages
        </p>
        
        {/* This is where the AI conversation history would appear */}
      </div>
      
      <div className="p-3 border-t">
        {replyToMessage && (
          <ReplyPreview replyTo={replyToMessage} onCancelReply={handleCancelReply} />
        )}
        
        {selectedFile && (
          <FilePreview 
            file={selectedFile} 
            onClear={() => {
              setSelectedFile(null);
              setAttachmentType(null);
            }}
            type={attachmentType}
          />
        )}
        
        <div className="flex items-end gap-2 mt-2">
          <div className="relative flex-1">
            <Textarea 
              placeholder="How can I help you?" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px] pr-10 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleRequestAssistance();
                }
              }}
            />
            <div className="absolute right-2 bottom-2">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <FileUploader 
              onFileSelect={handleFileSelect}
              activeAttachmentType={attachmentType}
              setActiveAttachmentType={setAttachmentType}
            />
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleRecordingToggle}
              className={isRecording ? "text-red-500" : ""}
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>
          
          <Button 
            onClick={handleRequestAssistance}
            disabled={(!prompt.trim() && !selectedFile) || isLoading}
            className="px-4"
          >
            {isLoading ? "Generating..." : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
