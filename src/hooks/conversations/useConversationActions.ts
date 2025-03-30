
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
      
      await deleteConversation(conversationId);
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleArchiveConversation = async (conversationId: string): Promise<void> => {
    try {
      const convoToUpdate = conversations.find(c => c.id === conversationId);
      if (!convoToUpdate) throw new Error("Conversation not found");
      
      const updatedConvo = { ...convoToUpdate, status: 'archived' };
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? updatedConvo : c)
      );

      if (activeConversation?.id === conversationId) {
        setActiveConversation(updatedConvo);
      }
      
      await archiveConversation(conversationId);
    } catch (error) {
      console.error("Error archiving conversation:", error);
      throw error;
    }
  };

  const handleAddTag = async (conversationId: string, tag: string): Promise<void> => {
    try {
      const convoToUpdate = conversations.find(c => c.id === conversationId);
      if (!convoToUpdate) throw new Error("Conversation not found");
      
      const currentTags = convoToUpdate.tags || [];
      if (currentTags.includes(tag)) return;
      
      const updatedTags = [...currentTags, tag];
      
      const updatedConvo = { ...convoToUpdate, tags: updatedTags };
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? updatedConvo : c)
      );

      if (activeConversation?.id === conversationId) {
        setActiveConversation(updatedConvo);
      }
      
      await addTagToConversation(conversationId, tag);
    } catch (error) {
      console.error("Error adding tag:", error);
      throw error;
    }
  };

  const handleAssignConversation = async (conversationId: string, assignee: string): Promise<void> => {
    try {
      const convoToUpdate = conversations.find(c => c.id === conversationId);
      if (!convoToUpdate) throw new Error("Conversation not found");
      
      const updatedConvo = { ...convoToUpdate, assignedTo: assignee };
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? updatedConvo : c)
      );

      if (activeConversation?.id === conversationId) {
        setActiveConversation(updatedConvo);
      }
      
      await assignConversation(conversationId, assignee);
    } catch (error) {
      console.error("Error assigning conversation:", error);
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
