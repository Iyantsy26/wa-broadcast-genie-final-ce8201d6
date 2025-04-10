
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, StopCircle } from 'lucide-react';
import { toast } from "sonner";

interface VoiceRecorderProps {
  onRecordingComplete?: (durationInSeconds: number) => void;
  onVoiceMessageReady?: (durationInSeconds: number) => void;
  disabled?: boolean;
  isRecording?: boolean;
  setIsRecording?: React.Dispatch<React.SetStateAction<boolean>>;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete,
  onVoiceMessageReady,
  disabled = false,
  isRecording = false,
  setIsRecording
}) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<number | null>(null);
  const internalIsRecording = useRef(false);
  
  // Handle internal or external recording state
  const isCurrentlyRecording = setIsRecording ? isRecording : internalIsRecording.current;

  const toggleVoiceRecording = () => {
    if (isCurrentlyRecording) {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      // Use the appropriate callback
      if (onRecordingComplete) {
        onRecordingComplete(recordingTime);
      } else if (onVoiceMessageReady) {
        onVoiceMessageReady(recordingTime);
      }
      
      setRecordingTime(0);
      
      if (setIsRecording) {
        setIsRecording(false);
      } else {
        internalIsRecording.current = false;
      }
    } else {
      toast("Recording started", {
        description: "Voice recording has started. Click the stop button when finished.",
      });
      
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      if (setIsRecording) {
        setIsRecording(true);
      } else {
        internalIsRecording.current = true;
      }
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {!isCurrentlyRecording ? (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleVoiceRecording}
          disabled={disabled}
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
    </>
  );
};

export default VoiceRecorder;
