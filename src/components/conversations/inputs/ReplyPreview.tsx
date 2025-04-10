
import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { Message } from '@/types/conversation';

interface ReplyPreviewProps {
  replyTo?: Message | null;  // Main prop for the message being replied to
  message?: Message | null;  // Alias for backwards compatibility
  onCancelReply: () => void;
}

const ReplyPreview: React.FC<ReplyPreviewProps> = ({ replyTo, message, onCancelReply }) => {
  // Use replyTo if provided, otherwise fall back to message for backwards compatibility
  const replyMessage = replyTo || message;
  
  if (!replyMessage) return null;
  
  return (
    <div className="mb-2 p-2 bg-gray-100 rounded-md flex items-center justify-between">
      <div className="flex-1">
        <span className="text-xs text-muted-foreground">Replying to:</span>
        <p className="text-sm truncate">{replyMessage.content}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onCancelReply}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ReplyPreview;
