
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ArchiveConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName: string;
  conversationId: string;
  onArchive: (conversationId: string) => Promise<void>;
}

const ArchiveConversationDialog: React.FC<ArchiveConversationDialogProps> = ({
  open,
  onOpenChange,
  contactName,
  conversationId,
  onArchive
}) => {
  const handleArchive = async () => {
    try {
      // Close dialog before archive action to prevent UI freezing
      onOpenChange(false);
      // Execute archive after dialog is closed
      await onArchive(conversationId);
    } catch (error) {
      console.error("Error archiving conversation:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Conversation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to archive this conversation with {contactName}? 
            Archived conversations can be accessed later from the archive section.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive}>
            Archive
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ArchiveConversationDialog;
