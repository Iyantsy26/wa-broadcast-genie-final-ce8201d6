
import { Conversation } from '@/types/conversation';
import { 
  deleteConversation, 
  archiveConversation, 
  addTagToConversation,
  assignConversation 
} from '@/services/conversationService';
import { toast } from '@/hooks/use-toast';

export const useConversationActions = (
  conversations: Conversation[],
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>,
  activeConversation: Conversation | null,
  setActiveConversation: React.Dispatch<React.SetStateAction<Conversation | null>>,
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const handleDeleteConversation = async (conversationId: string): Promise<void> => {
    try {
      const isActive = activeConversation?.id === conversationId;
      
      // Update UI state immediately
      setConversations(prev => prev.filter(convo => convo.id !== conversationId));
      
      if (isActive) {
        const remainingConversations = conversations.filter(c => c.id !== conversationId);
        if (remainingConversations.length > 0) {
          setActiveConversation(remainingConversations[0]);
        } else {
          setActiveConversation(null);
        }
        setIsSidebarOpen(false);
      }
      
      // Perform API call
      await deleteConversation(conversationId);
      
      // Show success toast
      toast({
        title: "Conversation deleted",
        description: "The conversation has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      
      // Revert UI state on error
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive",
      });
      
      // Refresh conversation list to revert changes
      throw error;
    }
  };

  const handleArchiveConversation = async (conversationId: string): Promise<void> => {
    try {
      const convoToUpdate = conversations.find(c => c.id === conversationId);
      if (!convoToUpdate) throw new Error("Conversation not found");
      
      // Update UI state immediately
      const updatedConvo = { ...convoToUpdate, status: 'archived' };
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? updatedConvo : c)
      );

      if (activeConversation?.id === conversationId) {
        setActiveConversation(updatedConvo);
      }
      
      // Perform API call
      await archiveConversation(conversationId);
      
      // Show success toast
      toast({
        title: "Conversation archived",
        description: "The conversation has been archived successfully.",
      });
    } catch (error) {
      console.error("Error archiving conversation:", error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to archive conversation. Please try again.",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const handleAddTag = async (conversationId: string, tag: string): Promise<void> => {
    try {
      const convoToUpdate = conversations.find(c => c.id === conversationId);
      if (!convoToUpdate) throw new Error("Conversation not found");
      
      const currentTags = convoToUpdate.tags || [];
      if (currentTags.includes(tag)) {
        toast({
          title: "Tag already exists",
          description: `The tag "${tag}" is already applied to this conversation.`,
        });
        return;
      }
      
      // Update UI state immediately
      const updatedTags = [...currentTags, tag];
      const updatedConvo = { ...convoToUpdate, tags: updatedTags };
      
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? updatedConvo : c)
      );

      if (activeConversation?.id === conversationId) {
        setActiveConversation(updatedConvo);
      }
      
      // Perform API call
      await addTagToConversation(conversationId, tag);
      
      // Show success toast
      toast({
        title: "Tag added",
        description: `The tag "${tag}" has been added to the conversation.`,
      });
    } catch (error) {
      console.error("Error adding tag:", error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to add tag. Please try again.",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const handleAssignConversation = async (conversationId: string, assignee: string): Promise<void> => {
    try {
      const convoToUpdate = conversations.find(c => c.id === conversationId);
      if (!convoToUpdate) throw new Error("Conversation not found");
      
      // Update UI state immediately
      const updatedConvo = { ...convoToUpdate, assignedTo: assignee };
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? updatedConvo : c)
      );

      if (activeConversation?.id === conversationId) {
        setActiveConversation(updatedConvo);
      }
      
      // Perform API call
      await assignConversation(conversationId, assignee);
      
      // Show success toast
      toast({
        title: "Conversation assigned",
        description: "The conversation has been assigned successfully.",
      });
    } catch (error) {
      console.error("Error assigning conversation:", error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to assign conversation. Please try again.",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return {
    handleDeleteConversation,
    handleArchiveConversation,
    handleAddTag,
    handleAssignConversation
  };
};
