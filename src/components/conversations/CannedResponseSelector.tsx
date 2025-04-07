
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from 'lucide-react';

interface CannedResponseSelectorProps {
  onSelectResponse: (responseText: string) => void;
  onClose: () => void;
  onSelectReply?: (replyId: string) => void;
  cannedReplies?: Array<{id: string, title: string, content: string}>;
}

const CannedResponseSelector: React.FC<CannedResponseSelectorProps> = ({
  onSelectResponse,
  onClose,
  onSelectReply,
  cannedReplies
}) => {
  // Sample canned responses if none are provided
  const cannedResponses = cannedReplies || [
    {
      id: 'greeting',
      title: 'Greeting',
      content: 'Hello! Thank you for reaching out. How can I assist you today?'
    },
    {
      id: 'followup',
      title: 'Follow-up',
      content: 'I wanted to follow up on our previous conversation. Have you had a chance to review the information I sent?'
    },
    {
      id: 'thanks',
      title: 'Thank You',
      content: 'Thank you for your message. We appreciate your business!'
    },
    {
      id: 'callback',
      title: 'Request Callback',
      content: 'I\'d like to schedule a call to discuss this further. What time works best for you?'
    },
    {
      id: 'away',
      title: 'Away Message',
      content: 'I\'m currently away from my desk. I\'ll respond to your message as soon as I return.'
    }
  ];

  const handleSelectResponse = (response: {id: string, content: string}) => {
    if (onSelectReply) {
      onSelectReply(response.id);
    } else {
      onSelectResponse(response.content);
    }
    onClose();
  };

  return (
    <Card className="p-3 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Canned Responses</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {cannedResponses.map((response) => (
          <div 
            key={response.id} 
            className="p-2 bg-muted rounded-md hover:bg-muted/70 cursor-pointer"
            onClick={() => handleSelectResponse(response)}
          >
            <div className="font-medium text-sm">{response.title}</div>
            <div className="text-xs text-muted-foreground truncate">{response.content}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CannedResponseSelector;
