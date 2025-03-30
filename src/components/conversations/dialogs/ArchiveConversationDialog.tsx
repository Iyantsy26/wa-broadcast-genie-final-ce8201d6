
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
import { toast } from "@/hooks/use-toast";

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
  const [isArchiving, setIsArchiving] = React.useState(false);

  const handleArchive = async () => {
    try {
      setIsArchiving(true);
      // Close dialog before archive action to prevent UI freezing
      onOpenChange(false);
      
      // Execute archive after dialog is closed
      await onArchive(conversationId);
      
      toast({
        title: "Conversation archived",
        description: `Conversation with ${contactName} has been archived.`,
      });
    } catch (error) {
      console.error("Error archiving conversation:", error);
      toast({
        title: "Error",
        description: "Failed to archive conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsArchiving(false);
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
          <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive} disabled={isArchiving}>
            {isArchiving ? 'Archiving...' : 'Archive'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ArchiveConversationDialog;
