
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Check } from 'lucide-react';

interface AIResponseGeneratorProps {
  currentMessage: string;
  onResponseGenerated: (response: string) => void;
  onClose: () => void;
}

const AIResponseGenerator: React.FC<AIResponseGeneratorProps> = ({
  currentMessage,
  onResponseGenerated,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Simulate AI generating responses
    const timer = setTimeout(() => {
      const generatedSuggestions = [
        "Thank you for reaching out. I'll look into this and get back to you shortly.",
        "I appreciate your message. Let me check this for you and I'll respond as soon as possible.",
        "Thanks for your inquiry. I'm gathering the information you need and will follow up soon."
      ];
      setSuggestions(generatedSuggestions);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentMessage]);

  const handleSelectResponse = (response: string) => {
    onResponseGenerated(response);
  };

  return (
    <Card className="p-3 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">AI Assistant Suggestions</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {loading ? (
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-5 bg-gray-200 animate-pulse rounded w-3/4"></div>
          <div className="h-5 bg-gray-200 animate-pulse rounded w-1/2"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className="p-2 bg-muted rounded-md flex justify-between items-start hover:bg-muted/70 cursor-pointer"
              onClick={() => handleSelectResponse(suggestion)}
            >
              <div className="text-sm flex-1 mr-2">{suggestion}</div>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AIResponseGenerator;
