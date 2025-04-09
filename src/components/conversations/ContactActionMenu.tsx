
import { useState } from 'react';
import { Button } from "@/components/ui/button";
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
  MoreHorizontal, 
  Ban, 
  Star, 
  Archive, 
  Trash2, 
  BellOff, 
  Bell
} from "lucide-react";
import { Contact } from "@/types/conversation";
import { blockContact } from "@/services/contactService";

interface ContactActionMenuProps {
  contact: Contact;
  onStarContact: (contactId: string) => void;
  onMuteContact: (contactId: string, muted: boolean) => void;
  onArchiveContact?: (contactId: string) => void;
  onBlockContact?: (contactId: string, blocked: boolean) => void;
  onDeleteConversation?: (contactId: string) => void;
}

export function ContactActionMenu({ 
  contact, 
  onStarContact,
  onMuteContact,
  onArchiveContact,
  onBlockContact,
  onDeleteConversation
}: ContactActionMenuProps) {
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const handleBlockContact = async () => {
    if (onBlockContact) {
      onBlockContact(contact.id, !contact.isBlocked);
    } else {
      const success = await blockContact(contact.id, !contact.isBlocked);
      if (success) {
        // Update UI or state as needed
      }
    }
    setBlockDialogOpen(false);
  };
  
  const handleDeleteConversation = () => {
    if (onDeleteConversation) {
      onDeleteConversation(contact.id);
    }
    setDeleteDialogOpen(false);
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onStarContact(contact.id)}>
            <Star className="mr-2 h-4 w-4" />
            {contact.isStarred ? 'Unstar Contact' : 'Star Contact'}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onMuteContact(contact.id, !contact.isMuted)}>
            {contact.isMuted ? (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Unmute Notifications
              </>
            ) : (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Mute Notifications
              </>
            )}
          </DropdownMenuItem>
          
          {onArchiveContact && (
            <DropdownMenuItem onClick={() => onArchiveContact(contact.id)}>
              <Archive className="mr-2 h-4 w-4" />
              Archive Chat
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="text-red-600" 
            onClick={() => setBlockDialogOpen(true)}
          >
            <Ban className="mr-2 h-4 w-4" />
            {contact.isBlocked ? 'Unblock Contact' : 'Block Contact'}
          </DropdownMenuItem>
          
          {onDeleteConversation && (
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Conversation
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {contact.isBlocked ? 'Unblock Contact' : 'Block Contact'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {contact.isBlocked 
                ? `Are you sure you want to unblock ${contact.name}? You will start receiving messages from this contact again.`
                : `Are you sure you want to block ${contact.name}? You will no longer receive messages from this contact.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBlockContact}
              className={contact.isBlocked ? undefined : 'bg-red-600 hover:bg-red-700'}
            >
              {contact.isBlocked ? 'Unblock' : 'Block'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation with {contact.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConversation}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
