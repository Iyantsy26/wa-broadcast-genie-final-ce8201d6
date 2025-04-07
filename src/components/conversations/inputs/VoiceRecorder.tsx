
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (durationInSeconds: number) => void;
  disabled: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete,
  disabled
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('Audio recorded:', audioUrl);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
        
        onRecordingComplete(recordingDuration);
        setRecordingDuration(0);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Could not access microphone. Please ensure you have granted permission.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {isRecording ? (
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-sm animate-pulse">
            {formatTime(recordingDuration)}
          </span>
          <Button 
            variant="destructive" 
            size="icon" 
            onClick={stopRecording}
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={startRecording}
          disabled={disabled}
        >
          <Mic className="h-5 w-5 text-muted-foreground" />
        </Button>
      )}
    </>
  );
};

export default VoiceRecorder;
