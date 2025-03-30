
import { Message, MessageStatus, MessageType } from '@/types/conversation';
import { supabase } from "@/integrations/supabase/client";

export const sendMessage = async (conversationId: string, messageData: Omit<Message, 'id'>): Promise<Message> => {
  try {
    // First, update the conversation's last message and timestamp
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        last_message: messageData.content || 'Attachment',
        last_message_timestamp: messageData.timestamp,
        status: 'active' // Set conversation to active when sending a message
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      throw updateError;
    }

    // Then, insert the new message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content: messageData.content,
        timestamp: messageData.timestamp,
        is_outbound: messageData.isOutbound,
        status: messageData.status,
        sender: messageData.sender,
        message_type: messageData.type,
        media_url: messageData.media?.url,
        media_type: messageData.media?.type,
        media_filename: messageData.media?.filename,
        media_duration: messageData.media?.duration
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    return {
      id: data.id,
      content: data.content || '',
      timestamp: data.timestamp,
      isOutbound: data.is_outbound || false,
      status: data.status as MessageStatus || 'sent',
      sender: data.sender,
      type: data.message_type as MessageType || 'text',
      media: data.media_url ? {
        url: data.media_url,
        type: data.media_type as 'image' | 'video' | 'document' | 'voice',
        filename: data.media_filename,
        duration: data.media_duration
      } : undefined
    };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
};
