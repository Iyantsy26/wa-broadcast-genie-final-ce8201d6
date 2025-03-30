
import { supabase } from "@/integrations/supabase/client";

export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    // First delete all messages associated with the conversation
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      throw messagesError;
    }

    // Then delete the conversation
    const { error: convError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (convError) {
      console.error('Error deleting conversation:', convError);
      throw convError;
    }
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    throw error;
  }
};
