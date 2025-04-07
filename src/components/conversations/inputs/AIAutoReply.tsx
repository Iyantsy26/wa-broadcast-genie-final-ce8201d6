
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bot, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AIAutoReplyProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: {
    enabled: boolean;
    message: string;
    activationDelay: number;
    respondToAll: boolean;
  }) => void;
}

const AIAutoReply: React.FC<AIAutoReplyProps> = ({ isOpen, onClose, onSave }) => {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState(
    "Hello! I'm currently unavailable. My AI assistant will help you in the meantime. I'll respond personally as soon as I'm back."
  );
  const [activationDelay, setActivationDelay] = useState(15); // minutes
  const [respondToAll, setRespondToAll] = useState(false);
  
  const handleSave = () => {
    onSave({
      enabled,
      message,
      activationDelay,
      respondToAll
    });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Auto-Reply Settings
          </DialogTitle>
          <DialogDescription>
            Configure your AI assistant to respond when you're unavailable
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-auto-reply" className="font-medium flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Enable AI Auto-Reply
            </Label>
            <Switch 
              id="enable-auto-reply" 
              checked={enabled} 
              onCheckedChange={setEnabled} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="auto-reply-message">Auto-Reply Message</Label>
            <Textarea 
              id="auto-reply-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the message that will be sent automatically"
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="activation-delay" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Activation Delay
            </Label>
            <Select 
              value={activationDelay.toString()} 
              onValueChange={(value) => setActivationDelay(parseInt(value))}
            >
              <SelectTrigger id="activation-delay">
                <SelectValue placeholder="Select delay time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Set how long to wait before activating auto-replies
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Label htmlFor="respond-to-all" className="font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Respond to all messages
            </Label>
            <Switch 
              id="respond-to-all" 
              checked={respondToAll} 
              onCheckedChange={setRespondToAll} 
            />
            <div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-1">
            When disabled, the assistant will only respond to new conversations
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIAutoReply;
