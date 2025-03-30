
import { supabase } from "@/integrations/supabase/client";

export const archiveConversation = async (conversationId: string): Promise<void> => {
  if (!conversationId) {
    console.error('Invalid conversation ID provided to archiveConversation');
    throw new Error('Invalid conversation ID');
  }

  try {
    const { error } = await supabase
      .from('conversations')
      .update({
        status: 'archived'
      })
      .eq('id', conversationId);

    if (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in archiveConversation:', error);
    throw error;
  }
};
