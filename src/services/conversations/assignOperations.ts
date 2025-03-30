
import { supabase } from "@/integrations/supabase/client";

export const assignConversation = async (conversationId: string, assignee: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({
        assigned_to: assignee
      })
      .eq('id', conversationId);

    if (error) {
      console.error('Error assigning conversation:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in assignConversation:', error);
    throw error;
  }
};
