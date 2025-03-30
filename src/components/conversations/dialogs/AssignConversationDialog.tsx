
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from '@/hooks/use-toast';

interface AssignConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  onAssign: (conversationId: string, assignee: string) => Promise<void>;
}

const AssignConversationDialog: React.FC<AssignConversationDialogProps> = ({
  open,
  onOpenChange,
  conversationId,
  onAssign
}) => {
  const [assigneeName, setAssigneeName] = useState('');

  const handleAssignSubmit = async () => {
    if (!assigneeName.trim()) return;
    
    try {
      await onAssign(conversationId, assigneeName.trim());
      onOpenChange(false);
      setAssigneeName('');
      toast({
        title: "Conversation assigned",
        description: `Conversation has been assigned to ${assigneeName}.`,
      });
    } catch (error) {
      console.error("Error assigning conversation:", error);
      toast({
        title: "Error",
        description: "Failed to assign conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Conversation</DialogTitle>
          <DialogDescription>
            Assign this conversation to a team member.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-y-2 py-4">
          <input
            type="text"
            placeholder="Enter team member name"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={assigneeName}
            onChange={(e) => setAssigneeName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAssignSubmit}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignConversationDialog;
