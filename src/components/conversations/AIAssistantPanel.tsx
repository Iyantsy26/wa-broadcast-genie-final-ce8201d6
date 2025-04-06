
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Send, Sparkles } from 'lucide-react';

export interface AIAssistantPanelProps {
  onRequestAIAssistance: (prompt: string) => Promise<string>;
  onClose: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onRequestAIAssistance, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const aiResponse = await onRequestAIAssistance(prompt);
      setResponse(aiResponse);
    } catch (error) {
      console.error('Error getting AI assistance:', error);
      setResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseResponse = () => {
    // Copy response to clipboard
    navigator.clipboard.writeText(response);
    setResponse('');
    setPrompt('');
  };

  return (
    <Card className="w-64 flex flex-col overflow-hidden h-full">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md flex items-center">
            <Sparkles className="h-4 w-4 text-primary mr-2" />
            AI Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {response && (
          <div className="mb-4 p-3 bg-muted rounded-lg text-sm">
            <div className="mb-2 font-medium text-xs text-muted-foreground">AI Suggestion:</div>
            <p>{response}</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full mt-2"
              onClick={handleUseResponse}
            >
              Copy to clipboard
            </Button>
          </div>
        )}
        <div className="space-y-2">
          <div className="text-sm font-medium">Example prompts:</div>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-left h-auto py-2 px-3"
              onClick={() => setPrompt("Help me draft a professional response to this inquiry.")}
            >
              Draft a professional response
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-left h-auto py-2 px-3"
              onClick={() => setPrompt("Suggest a follow-up message for this lead.")}
            >
              Suggest a follow-up
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-left h-auto py-2 px-3"
              onClick={() => setPrompt("Summarize the key points from this conversation.")}
            >
              Summarize conversation
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="block p-3 pt-0">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea 
            placeholder="How can AI help with this conversation?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-24 resize-none"
          />
          <Button 
            type="submit" 
            className="w-full"
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? (
              <>Generating...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Generate Response
              </>
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AIAssistantPanel;
