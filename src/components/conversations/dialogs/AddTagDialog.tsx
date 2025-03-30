
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
import { Input } from "@/components/ui/input";

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
  const [tag, setTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag.trim()) return;
    
    try {
      setIsSubmitting(true);
      // Close dialog before adding tag to prevent UI freezing
      onOpenChange(false);
      // Execute tag addition after dialog is closed
      await onAddTag(conversationId, tag.trim());
      setTag('');
    } catch (error) {
      console.error("Error adding tag:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset tag when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setTag('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tag</DialogTitle>
          <DialogDescription>
            Add a tag to categorize this conversation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Enter tag name"
              className="w-full"
              disabled={isSubmitting}
            />
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
              disabled={!tag.trim() || isSubmitting}
            >
              Add Tag
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTagDialog;
