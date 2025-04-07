
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, X } from 'lucide-react';

interface AIAssistantPanelProps {
  onRequestAIAssistance: () => void;
  onClose: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onRequestAIAssistance, onClose }) => {
  return (
    <Card className="w-80 flex flex-col shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle>AI Assistant</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardDescription className="px-6">
        Get AI-powered suggestions for your messages
      </CardDescription>
      
      <CardContent className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium mb-1">Suggested responses:</p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onRequestAIAssistance()}>
                Thank you for your inquiry!
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onRequestAIAssistance()}>
                I'll check and get back to you soon.
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onRequestAIAssistance()}>
                Could you provide more details?
              </Button>
            </div>
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium mb-1">AI Actions:</p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onRequestAIAssistance()}>
                Summarize conversation
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onRequestAIAssistance()}>
                Draft follow-up email
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onRequestAIAssistance()}>
                Generate meeting agenda
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <Button 
          className="w-full" 
          onClick={onRequestAIAssistance}
        >
          Generate AI Response
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AIAssistantPanel;
