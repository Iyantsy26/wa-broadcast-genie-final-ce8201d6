
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

export interface AIAssistantPanelProps {
  onRequestAIAssistance: (prompt: string) => Promise<string>;
  onClose: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  onRequestAIAssistance,
  onClose
}) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const aiResponse = await onRequestAIAssistance(prompt);
      setResponse(aiResponse);
    } catch (error) {
      console.error('Error requesting AI assistance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-80 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">AI Assistant</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="flex-1 space-y-4">
          {response && (
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="text-xs font-medium mb-1">AI Suggestion:</p>
              <p>{response}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Textarea
            placeholder="Ask AI for help with your message..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-none"
            rows={4}
          />
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? 'Generating...' : 'Get AI Assistance'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistantPanel;
