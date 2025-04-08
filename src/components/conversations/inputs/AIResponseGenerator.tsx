
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquareDiff } from 'lucide-react';

interface AIResponseGeneratorProps {
  onGenerateResponse: () => void;
  disabled: boolean;
  isGenerating: boolean;
}

const AIResponseGenerator: React.FC<AIResponseGeneratorProps> = ({ 
  onGenerateResponse, 
  disabled,
  isGenerating
}) => {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      disabled={disabled || isGenerating}
      onClick={onGenerateResponse}
      title="Get AI assistance with this message"
    >
      <MessageSquareDiff className="h-5 w-5" />
    </Button>
  );
};

export default AIResponseGenerator;
