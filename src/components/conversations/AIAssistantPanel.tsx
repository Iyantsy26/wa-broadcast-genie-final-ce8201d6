
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AIAssistantPanelProps {
  onRequestAIAssistance: () => void;
  onClose: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onRequestAIAssistance, onClose }) => {
  return (
    <div className="w-80 flex flex-col bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold">AI Assistant</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 p-4">
        <p className="text-sm text-muted-foreground mb-4">
          Get AI-powered suggestions for responding to messages
        </p>
        <Button 
          className="w-full" 
          onClick={onRequestAIAssistance}
        >
          Generate Response
        </Button>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
