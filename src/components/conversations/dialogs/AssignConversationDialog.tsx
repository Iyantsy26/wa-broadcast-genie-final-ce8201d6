
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    if (!assignee) return;
    
    try {
      setIsSubmitting(true);
      // Close dialog before assigning to prevent UI freezing
      onOpenChange(false);
      // Execute assignment after dialog is closed
      await onAssign(conversationId, assignee);
    } catch (error) {
      console.error("Error assigning conversation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset assignee when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setAssignee('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              Assign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignConversationDialog;
