
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock team members data - in production this would come from a context or API
const TEAM_MEMBERS = [
  { id: 'alice', name: 'Alice Smith' },
  { id: 'bob', name: 'Bob Johnson' },
  { id: 'carol', name: 'Carol Williams' },
  { id: 'dave', name: 'Dave Brown' },
];

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
  const [assignee, setAssignee] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignee || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      await onAssign(conversationId, assignee);
      toast({
        title: "Conversation assigned",
        description: `Conversation has been assigned to ${TEAM_MEMBERS.find(m => m.id === assignee)?.name}.`,
      });
    } catch (error) {
      console.error("Error assigning conversation:", error);
      toast({
        title: "Error",
        description: "Failed to assign conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      onOpenChange(false);
    }
  };

  // Reset assignee when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setAssignee('');
      setIsSubmitting(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Conversation</DialogTitle>
          <DialogDescription>
            Assign this conversation to a team member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Select
              value={assignee}
              onValueChange={setAssignee}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_MEMBERS.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!assignee || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignConversationDialog;
