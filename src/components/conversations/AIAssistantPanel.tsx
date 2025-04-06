
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Bot,
  SendHorizonal,
  Copy
} from 'lucide-react';
import { useConversation } from '@/contexts/ConversationContext';

const AIAssistantPanel = () => {
  const { setAiAssistantActive } = useConversation();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [responses, setResponses] = useState<Array<{
    prompt: string;
    response: string;
    timestamp: string;
  }>>([
    {
      prompt: "Help me draft a message to follow up with a client who hasn't responded in 2 weeks",
      response: "Subject: Following Up on Our Previous Conversation\n\nDear [Client Name],\n\nI hope this message finds you well. I wanted to check in on our previous discussion from two weeks ago regarding [specific topic/project]. I understand schedules can get busy, and I'm reaching out to see if you have any updates or if there's anything I can assist you with at this point.\n\nIf you need more information or would like to schedule a call to discuss further, please let me know.\n\nLooking forward to hearing from you soon.\n\nBest regards,\n[Your Name]",
      timestamp: new Date().toISOString()
    }
  ]);
  
  const generateResponse = () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI response generation
    setTimeout(() => {
      const demoResponses = [
        "I've drafted a response for you:\n\nThank you for reaching out. I appreciate your interest in our services. Based on what you've shared, I believe our [Product/Service] would be an excellent fit for your needs. I'd be happy to schedule a call to discuss the details further and answer any questions you might have.\n\nWould you be available for a 30-minute conversation this week? If so, please let me know what times work best for you.\n\nLooking forward to connecting soon.",
        
        "Here's a professional response you can use:\n\nI wanted to follow up regarding the proposal we discussed last week. I've taken your feedback into account and have made the adjustments we talked about. The updated version is attached to this message for your review.\n\nI believe these changes address your concerns about [specific concern]. Please take a look when you have a moment, and let me know if you'd like to proceed or if you need any further modifications.\n\nThank you for your continued interest in working with us.",
        
        "For your situation, I recommend:\n\nI understand your frustration regarding [issue]. We take matters like this very seriously, and I want to assure you that we're working diligently to resolve it.\n\nI've escalated this to our technical team, who are investigating the root cause. We expect to have a solution in place within the next 24-48 hours. In the meantime, a temporary workaround is to [suggestion].\n\nI'll personally follow up with you tomorrow with an update. Thank you for your patience and understanding."
      ];
      
      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      
      setResponses(prev => [
        {
          prompt: prompt,
          response: randomResponse,
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);
      
      setPrompt('');
      setIsGenerating(false);
    }, 2000);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <div className="w-72 flex flex-col bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setAiAssistantActive(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Input area */}
      <div className="p-3 border-b">
        <Textarea
          placeholder="What would you like help with?"
          className="min-h-[80px] mb-2"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button 
          className="w-full"
          onClick={generateResponse}
          disabled={!prompt.trim() || isGenerating}
        >
          {isGenerating ? (
            <span className="flex items-center">
              <span className="mr-2">Generating</span>
              <span className="flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-150">.</span>
                <span className="animate-bounce delay-300">.</span>
              </span>
            </span>
          ) : (
            <span className="flex items-center">
              <SendHorizonal className="mr-2 h-4 w-4" />
              Generate Response
            </span>
          )}
        </Button>
      </div>
      
      {/* Response history */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {responses.map((item, index) => (
            <div key={index} className="bg-muted/40 rounded-md p-3">
              <div className="text-xs text-muted-foreground mb-1">
                <span className="font-medium">Prompt:</span> {item.prompt}
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium">Response:</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => copyToClipboard(item.response)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xs whitespace-pre-wrap">{item.response}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AIAssistantPanel;
