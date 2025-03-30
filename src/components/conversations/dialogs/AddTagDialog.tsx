
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

interface AddTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  onAddTag: (conversationId: string, tag: string) => Promise<void>;
}

const AddTagDialog: React.FC<AddTagDialogProps> = ({
  open,
  onOpenChange,
  conversationId,
  onAddTag
}) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTagSubmit = async () => {
    if (!tagInput.trim()) return;
    
    try {
      await onAddTag(conversationId, tagInput.trim());
      onOpenChange(false);
      setTagInput('');
      toast({
        title: "Tag added",
        description: `Tag "${tagInput}" has been added to this conversation.`,
      });
    } catch (error) {
      console.error("Error adding tag:", error);
      toast({
        title: "Error",
        description: "Failed to add tag. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Tag</DialogTitle>
          <DialogDescription>
            Add tags to categorize this conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-y-2 py-4">
          <input
            type="text"
            placeholder="Enter tag name"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAddTagSubmit}>Add Tag</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTagDialog;
