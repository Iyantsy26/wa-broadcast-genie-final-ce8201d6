
import { Message, MessageStatus, MessageType } from '@/types/conversation';
import { supabase } from "@/integrations/supabase/client";

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return (data || []).map(msg => ({
      id: msg.id,
      content: msg.content || '',
      timestamp: msg.timestamp,
      isOutbound: msg.is_outbound || false,
      status: (msg.status || 'sent') as MessageStatus,
      sender: msg.sender,
      type: (msg.message_type || 'text') as MessageType,
      media: msg.media_url ? {
        url: msg.media_url,
        type: msg.media_type as 'image' | 'video' | 'document' | 'voice',
        filename: msg.media_filename,
        duration: msg.media_duration,
        size: 0 // Default value since it's not in the database
      } : undefined
    }));
  } catch (error) {
    console.error('Error in getMessages:', error);
    return [];
  }
};
