
import { Message, MessageType } from '@/types/conversation';
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export const sendMessage = async (
  conversationId: string,
  content: string,
  type: MessageType = 'text',
  senderId: string,
  recipientId: string,
  mediaUrl?: string,
  replyToId?: string
): Promise<Message | null> => {
  try {
    const timestamp = new Date().toISOString();
    const messageId = uuidv4();
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        id: messageId,
        conversation_id: conversationId,
        content,
        message_type: type,
        timestamp,
        sender_id: senderId,
        recipient_id: recipientId,
        is_outbound: true,
        status: 'sent',
        media_url: mediaUrl,
        media_type: mediaUrl ? type : undefined,
        reply_to_id: replyToId
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    // Update the conversation's last message
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        last_message: content,
        last_message_timestamp: timestamp,
        updated_at: timestamp
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
    }

    // Return formatted message
    return {
      id: messageId,
      content,
      timestamp,
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      type,
      media: mediaUrl ? {
        url: mediaUrl,
        type: type as any,
        filename: mediaUrl.split('/').pop() || 'file'
      } : undefined,
      reactions: []
    };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return null;
  }
};
