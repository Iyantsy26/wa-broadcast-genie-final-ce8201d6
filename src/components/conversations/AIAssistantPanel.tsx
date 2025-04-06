
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, X } from 'lucide-react';

interface AIAssistantPanelProps {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const aiResponse = await onRequestAIAssistance(prompt);
      setResponse(aiResponse);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setResponse("Sorry, there was an error generating a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-80 h-full flex flex-col">
      <CardHeader className="bg-muted/50 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Bot className="mr-2 h-5 w-5" />
            AI Assistant
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 flex-1 overflow-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              What would you like help with?
            </label>
            <Textarea
              id="prompt"
              placeholder="e.g., Draft a follow-up email for a client who hasn't responded in a week"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-24"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || !prompt.trim()}>
            {isLoading ? "Generating..." : "Get AI Assistance"}
          </Button>
        </form>

        {response && (
          <div className="mt-6">
            <h3 className="font-medium mb-2 text-sm">AI Response:</h3>
            <div className="bg-muted/30 p-3 rounded text-sm whitespace-pre-wrap border">
              {response}
            </div>
            <div className="flex justify-end mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigator.clipboard.writeText(response)}
              >
                Copy to Clipboard
              </Button>
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <h3 className="font-medium mb-3 text-sm">Suggested Prompts:</h3>
          <div className="space-y-2">
            {[
              "Draft a polite reminder for an overdue invoice",
              "Write a welcome message for a new client",
              "Create a response for a pricing inquiry",
              "Generate a meeting follow-up message"
            ].map((suggestedPrompt, index) => (
              <Button 
                key={index}
                variant="outline" 
                className="w-full justify-start h-auto py-2 px-3 text-left text-sm font-normal"
                onClick={() => setPrompt(suggestedPrompt)}
              >
                {suggestedPrompt}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-3 text-xs text-muted-foreground">
        <p>AI responses are suggestions and may require editing before sending.</p>
      </CardFooter>
    </Card>
  );
};

export default AIAssistantPanel;
