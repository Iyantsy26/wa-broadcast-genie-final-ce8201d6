
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
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
    if (!tag.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      await onAddTag(conversationId, tag.trim());
      toast({
        title: "Tag added",
        description: `Tag "${tag}" has been added to the conversation.`,
      });
    } catch (error) {
      console.error("Error adding tag:", error);
      toast({
        title: "Error",
        description: "Failed to add tag. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      onOpenChange(false);
    }
  };

  // Reset tag when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTag('');
      setIsSubmitting(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
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
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Tag'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTagDialog;
