
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
      if (!conversationId) throw new Error("Invalid conversation ID");
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
      
      toast({
        title: "Success",
        description: "Conversation deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const handleArchiveConversation = async (conversationId: string): Promise<void> => {
    try {
      if (!conversationId) throw new Error("Invalid conversation ID");
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
      
      toast({
        title: "Success",
        description: "Conversation archived successfully.",
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
      if (!conversationId) throw new Error("Invalid conversation ID");
      if (!tag || !tag.trim()) throw new Error("Invalid tag");
      
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
      
      toast({
        title: "Success",
        description: `Tag "${tag}" added successfully.`,
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
      if (!conversationId) throw new Error("Invalid conversation ID");
      if (!assignee) throw new Error("Invalid assignee");
      
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
      
      toast({
        title: "Success",
        description: `Conversation assigned to ${assignee} successfully.`,
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
