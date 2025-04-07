
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
  
  const getReplyContent = () => {
    if (replyTo.content) return replyTo.content;
    
    switch (replyTo.type) {
      case 'image': return 'Image';
      case 'video': return 'Video';
      case 'document': return replyTo.media?.filename || 'Document';
      case 'voice': return `Voice message (${replyTo.media?.duration || 0}s)`;
      case 'location': return 'Location';
      default: return 'Message';
    }
  };
  
  return (
    <div className="p-2 bg-gray-100 border-t mb-2 flex items-center justify-between rounded-md">
      <div className="flex-1">
        <div className="flex items-center">
          <div className="w-1 h-full bg-primary mr-2"></div>
          <div>
            <span className="text-xs font-medium mb-1">
              Replying to {replyTo.isOutbound ? 'yourself' : replyTo.sender || 'Contact'}
            </span>
            <p className="text-sm truncate text-muted-foreground">{getReplyContent()}</p>
          </div>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6" 
        onClick={onCancelReply}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ReplyPreview;
