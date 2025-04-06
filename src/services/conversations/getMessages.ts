
import { Message } from '@/types/conversation';
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

    // Map database messages to our Message type
    return (data || []).map(msg => ({
      id: msg.id,
      content: msg.content || '',
      timestamp: msg.timestamp,
      isOutbound: msg.is_outbound || false,
      status: msg.status as any,
      sender: msg.sender || '',
      type: (msg.message_type || 'text') as any,
      media: msg.media_url ? {
        url: msg.media_url,
        type: (msg.media_type || 'image') as any,
        filename: msg.media_filename,
        duration: msg.media_duration,
        size: msg.media_duration
      } : undefined,
      replyTo: undefined, // You can expand this if needed
      reactions: [] // You can expand this if needed
    }));
  } catch (error) {
    console.error('Error in getMessages:', error);
    return [];
  }
};
