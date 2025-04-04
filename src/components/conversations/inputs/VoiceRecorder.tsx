
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, StopCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete: (durationInSeconds: number) => void;
  disabled?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<number | null>(null);

  const toggleVoiceRecording = () => {
    if (isRecording) {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      onRecordingComplete(recordingTime);
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

  return (
    <>
      {!isRecording ? (
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
