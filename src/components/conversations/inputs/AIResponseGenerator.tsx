
import React from 'react';
import { Button } from "@/components/ui/button";
import { Bot } from 'lucide-react';

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
      variant="outline" 
      size="icon"
      onClick={onGenerateResponse}
      disabled={disabled || isGenerating}
      title="Generate AI response"
      className={isGenerating ? 'animate-pulse' : ''}
    >
      <Bot className="h-5 w-5" />
    </Button>
  );
};

export default AIResponseGenerator;
