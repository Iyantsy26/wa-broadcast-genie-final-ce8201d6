
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquareDiff } from 'lucide-react';

interface AIResponseGeneratorProps {
  onGenerateResponse?: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  isActive?: boolean;
  setIsActive?: React.Dispatch<React.SetStateAction<boolean>>;
  onRequestAIAssistance?: (prompt: string) => Promise<string>;
  onResponseGenerated?: (response: any) => void;
}

const AIResponseGenerator: React.FC<AIResponseGeneratorProps> = ({ 
  onGenerateResponse, 
  disabled = false,
  isGenerating = false,
  isActive = false,
  setIsActive,
  onRequestAIAssistance,
  onResponseGenerated
}) => {
  const handleClick = () => {
    if (onGenerateResponse) {
      onGenerateResponse();
    } else if (setIsActive) {
      setIsActive(!isActive);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      disabled={disabled || isGenerating}
      onClick={handleClick}
      title="Get AI assistance with this message"
      className={isActive ? "text-primary" : ""}
    >
      <MessageSquareDiff className="h-5 w-5" />
    </Button>
  );
};

export default AIResponseGenerator;
