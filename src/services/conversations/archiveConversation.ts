
import { supabase } from "@/integrations/supabase/client";

export const archiveConversation = async (conversationId: string): Promise<void> => {
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
