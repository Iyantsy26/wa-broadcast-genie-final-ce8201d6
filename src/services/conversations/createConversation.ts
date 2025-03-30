
import { supabase } from "@/integrations/supabase/client";

export const createConversation = async (contactId: string, contactType: 'client' | 'lead', initialMessage?: string): Promise<string> => {
  try {
    const timestamp = new Date().toISOString();
    const conversationData: any = {
      status: 'new',
      last_message: initialMessage || '',
      last_message_timestamp: timestamp,
    };
    
    if (contactType === 'client') {
      conversationData.client_id = contactId;
    } else {
      conversationData.lead_id = contactId;
    }
    
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
    
    if (initialMessage) {
      await supabase
        .from('messages')
        .insert({
          conversation_id: data.id,
          content: initialMessage,
          timestamp: timestamp,
          is_outbound: true,
          status: 'sent',
          sender: 'System',
          message_type: 'text'
        });
    }
    
    return data.id;
  } catch (error) {
    console.error('Error in createConversation:', error);
    throw error;
  }
};
