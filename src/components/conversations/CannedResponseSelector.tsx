
import React from 'react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from 'lucide-react';

interface CannedResponseSelectorProps {
  cannedReplies: { id: string; title: string; content: string }[];
  onSelectReply: (replyId: string) => void;
}

const CannedResponseSelector: React.FC<CannedResponseSelectorProps> = ({
  cannedReplies,
  onSelectReply
}) => {
  return (
    <div className="border-t p-1 flex justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <MessageSquarePlus className="h-4 w-4" />
            <span>Canned Responses</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-1">
            <h4 className="font-medium">Quick Responses</h4>
            <p className="text-xs text-muted-foreground">
              Select a pre-written response to insert
            </p>
          </div>
          
          <div className="mt-3 max-h-60 overflow-y-auto space-y-1">
            {cannedReplies.map((reply) => (
              <button
                key={reply.id}
                className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
                onClick={() => onSelectReply(reply.id)}
              >
                <div className="font-medium">{reply.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {reply.content}
                </div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CannedResponseSelector;
