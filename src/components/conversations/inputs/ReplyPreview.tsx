
import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { Message } from '@/types/conversation';

interface ReplyPreviewProps {
  replyTo: Message | null;
  onCancelReply: () => void;
}

const ReplyPreview: React.FC<ReplyPreviewProps> = ({ replyTo, onCancelReply }) => {
  if (!replyTo) return null;
  
  return (
    <div className="mb-2 p-2 bg-gray-100 rounded-md flex items-center justify-between">
      <div className="flex-1">
        <span className="text-xs text-muted-foreground">Replying to:</span>
        <p className="text-sm truncate">{replyTo.content}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onCancelReply}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ReplyPreview;
