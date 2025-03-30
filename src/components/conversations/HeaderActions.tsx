
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Archive,
  Tag,
  UserPlus,
  Trash2
} from 'lucide-react';
import DeleteConversationDialog from './dialogs/DeleteConversationDialog';
import ArchiveConversationDialog from './dialogs/ArchiveConversationDialog';
import AddTagDialog from './dialogs/AddTagDialog';
import AssignConversationDialog from './dialogs/AssignConversationDialog';
import { Conversation } from '@/types/conversation';

interface HeaderActionsProps {
  conversation: Conversation;
  onDeleteConversation: (conversationId: string) => Promise<void>;
  onArchiveConversation: (conversationId: string) => Promise<void>;
  onAddTag: (conversationId: string, tag: string) => Promise<void>;
  onAssignConversation: (conversationId: string, assignee: string) => Promise<void>;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  conversation,
  onDeleteConversation,
  onArchiveConversation,
  onAddTag,
  onAssignConversation
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  return (
    <>
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

      <DeleteConversationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        contactName={conversation.contact.name}
        conversationId={conversation.id}
        onDelete={onDeleteConversation}
      />

      <ArchiveConversationDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        contactName={conversation.contact.name}
        conversationId={conversation.id}
        onArchive={onArchiveConversation}
      />

      <AddTagDialog
        open={showTagDialog}
        onOpenChange={setShowTagDialog}
        conversationId={conversation.id}
        onAddTag={onAddTag}
      />

      <AssignConversationDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        conversationId={conversation.id}
        onAssign={onAssignConversation}
      />
    </>
  );
};

export default HeaderActions;
