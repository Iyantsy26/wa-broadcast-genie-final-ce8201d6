
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';

interface EmptyConversationsProps {
  resetAllFilters: () => void;
}

const EmptyConversations: React.FC<EmptyConversationsProps> = ({ resetAllFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-muted-foreground">No conversations found with the current filters</p>
      <Button 
        variant="link" 
        onClick={resetAllFilters}
      >
        Clear filters
      </Button>
    </div>
  );
};

export default EmptyConversations;
