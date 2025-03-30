
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, 
  MoreHorizontal, 
  Smartphone,
  Archive,
  Tag,
  UserPlus,
  Trash2
} from 'lucide-react';
import { Conversation } from '@/types/conversation';
import { useConversation } from '@/contexts/ConversationContext';
import { toast } from '@/hooks/use-toast';

interface ConversationHeaderProps {
  conversation: Conversation;
  onOpenContactInfo: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onOpenContactInfo
}) => {
  const { handleDeleteConversation, handleArchiveConversation, handleAssignConversation, handleAddTag } = useConversation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [assigneeName, setAssigneeName] = useState('');

  const handleDelete = async () => {
    try {
      setShowDeleteDialog(false);
      await handleDeleteConversation(conversation.id);
      toast({
        title: "Conversation deleted",
        description: "The conversation has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async () => {
    try {
      await handleArchiveConversation(conversation.id);
      setShowArchiveDialog(false);
      toast({
        title: "Conversation archived",
        description: "The conversation has been archived.",
      });
    } catch (error) {
      console.error("Error archiving conversation:", error);
      toast({
        title: "Error",
        description: "Failed to archive conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddTagSubmit = async () => {
    if (!tagInput.trim()) return;
    
    try {
      await handleAddTag(conversation.id, tagInput.trim());
      setShowTagDialog(false);
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

  const handleAssignSubmit = async () => {
    if (!assigneeName.trim()) return;
    
    try {
      await handleAssignConversation(conversation.id, assigneeName.trim());
      setShowAssignDialog(false);
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
    <>
      <div className="p-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={conversation.contact.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {conversation.contact.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium flex items-center gap-1.5">
              {conversation.contact.name}
              {conversation.contact.isOnline && (
                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              {conversation.contact.phone}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onOpenContactInfo}>
            <User className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowArchiveDialog(true)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive conversation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowTagDialog(true)}>
                <Tag className="mr-2 h-4 w-4" />
                Add tags
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowAssignDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign to team member
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Conversation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation with {conversation.contact.name}? 
              This action cannot be undone and all messages will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Conversation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this conversation with {conversation.contact.name}? 
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

      {/* Add Tag Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
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
            <Button variant="outline" onClick={() => setShowTagDialog(false)}>Cancel</Button>
            <Button onClick={handleAddTagSubmit}>Add Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Conversation Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
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
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignSubmit}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConversationHeader;
