
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useConversation } from '@/contexts/ConversationContext';

const EmptyConversation = () => {
  const { contacts, selectContact } = useConversation();
  
  // Find a suitable contact to suggest
  const suggestedContact = contacts.find(c => !c.isArchived && !c.isBlocked);
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="h-8 w-8 text-primary" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">No conversation selected</h3>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        Select a conversation from the sidebar or start a new conversation to begin messaging.
      </p>
      
      {suggestedContact && (
        <Button onClick={() => selectContact(suggestedContact.id)}>
          Chat with {suggestedContact.name}
        </Button>
      )}
    </div>
  );
};

export default EmptyConversation;
