
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
  Trash2,
  Star,
  BellOff,
  Bell,
  Phone,
  Video,
  Search,
  Flag
} from 'lucide-react';
import DeleteConversationDialog from './dialogs/DeleteConversationDialog';
import ArchiveConversationDialog from './dialogs/ArchiveConversationDialog';
import AddTagDialog from './dialogs/AddTagDialog';
import AssignConversationDialog from './dialogs/AssignConversationDialog';
import { Conversation } from '@/types/conversation';
import { toast } from '@/hooks/use-toast';

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
  const [isMuted, setIsMuted] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  // Only open one dialog at a time
  const closeAllDialogs = () => {
    setShowDeleteDialog(false);
    setShowArchiveDialog(false);
    setShowTagDialog(false);
    setShowAssignDialog(false);
  };

  const openDeleteDialog = () => {
    closeAllDialogs();
    setShowDeleteDialog(true);
  };

  const openArchiveDialog = () => {
    closeAllDialogs();
    setShowArchiveDialog(true);
  };

  const openTagDialog = () => {
    closeAllDialogs();
    setShowTagDialog(true);
  };

  const openAssignDialog = () => {
    closeAllDialogs();
    setShowAssignDialog(true);
  };
  
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? 'Conversation unmuted' : 'Conversation muted',
      description: isMuted 
        ? 'You will now receive notifications from this contact' 
        : 'You will no longer receive notifications from this contact',
    });
  };
  
  const handleToggleStar = () => {
    setIsStarred(!isStarred);
    toast({
      title: isStarred ? 'Conversation unstarred' : 'Conversation starred',
      description: isStarred 
        ? 'The conversation has been removed from your starred list' 
        : 'The conversation has been added to your starred list',
    });
  };
  
  const handleVideoCall = () => {
    toast({
      title: 'Starting video call',
      description: `Initiating video call with ${conversation.contact.name}...`,
    });
  };
  
  const handleVoiceCall = () => {
    toast({
      title: 'Starting voice call',
      description: `Calling ${conversation.contact.name}...`,
    });
  };
  
  const handleReport = () => {
    toast({
      title: 'Report submitted',
      description: 'Thank you for your report. We will review it shortly.',
    });
  };
  
  const handleSearch = () => {
    toast({
      title: 'Search conversation',
      description: 'Search functionality will be available soon.',
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white z-50">
          <DropdownMenuItem onClick={handleVoiceCall}>
            <Phone className="mr-2 h-4 w-4" />
            Voice call
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleVideoCall}>
            <Video className="mr-2 h-4 w-4" />
            Video call
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search in conversation
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleToggleMute}>
            {isMuted ? (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Unmute notifications
              </>
            ) : (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Mute notifications
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStar}>
            <Star className="mr-2 h-4 w-4" fill={isStarred ? "currentColor" : "none"} />
            {isStarred ? "Unstar conversation" : "Star conversation"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openArchiveDialog}>
            <Archive className="mr-2 h-4 w-4" />
            Archive conversation
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openTagDialog}>
            <Tag className="mr-2 h-4 w-4" />
            Add tags
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openAssignDialog}>
            <UserPlus className="mr-2 h-4 w-4" />
            Assign to team member
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleReport}>
            <Flag className="mr-2 h-4 w-4" />
            Report conversation
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600"
            onClick={openDeleteDialog}
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
