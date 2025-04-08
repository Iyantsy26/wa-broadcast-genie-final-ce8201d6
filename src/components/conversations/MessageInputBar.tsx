
import React, { useState, useRef } from 'react';
import { Message } from '@/types/conversation';

interface MessageInputBarProps {
  replyTo: Message | null;
  onCancelReply: () => void;
  onSendMessage: (message: string) => void;
  onSendVoiceMessage: (durationInSeconds: number) => void;
  deviceId: string;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({
  replyTo,
  onCancelReply,
  onSendMessage,
  onSendVoiceMessage,
  deviceId
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    recordingInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    
    onSendVoiceMessage(recordingTime);
    setIsRecording(false);
    setRecordingTime(0);
  };

  return (
    <div className="border-t p-3 bg-white">
      {replyTo && (
        <div className="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded">
          <div className="flex-1 truncate">
            <div className="text-xs font-medium">Replying to:</div>
            <div className="text-sm truncate">{replyTo.content}</div>
          </div>
          <button 
            className="ml-2 text-gray-500 hover:text-gray-700"
            onClick={onCancelReply}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button 
          type="button"
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
        </button>
        
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={`Type a message via device #${deviceId}...`}
            className="w-full border rounded-full px-4 py-2 focus:outline-none focus:border-blue-400"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {message ? (
          <button 
            type="submit"
            className="p-2 bg-blue-600 text-white rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 3 3 9-3 9 19-9Z"></path>
              <path d="M6 12h16"></path>
            </svg>
          </button>
        ) : (
          <button 
            type="button"
            className={`p-2 ${isRecording ? 'bg-red-500' : 'bg-gray-200'} ${isRecording ? 'text-white' : 'text-gray-600'} rounded-full`}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={() => isRecording && stopRecording()}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" x2="12" y1="19" y2="22"></line>
            </svg>
            {isRecording && (
              <div className="absolute top-1 right-1 text-xs bg-red-600 rounded-full px-1">
                {recordingTime}s
              </div>
            )}
          </button>
        )}
      </form>
    </div>
  );
};

export default MessageInputBar;
