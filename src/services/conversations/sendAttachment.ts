
import { Message, MessageStatus, MessageType } from '@/types/conversation';
import { supabase } from "@/integrations/supabase/client";

export const sendAttachment = async (
  conversationId: string,
  file: File, 
  mediaType: 'image' | 'video' | 'document',
  deviceId: string
): Promise<Message> => {
  try {
    const timestamp = new Date().toISOString();
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${conversationId}/${Date.now()}.${fileExtension}`;
    
    // Create a URL to show the file preview immediately
    const fileUrl = URL.createObjectURL(file);
    
    // In a real app, we would upload the file to a server here
    // For now, we'll simulate a successful upload
    
    // Generate a random ID to simulate the message creation
    const messageId = `msg_${Math.random().toString(36).substring(2, 15)}`;
    
    const newMessage: Message = {
      id: messageId,
      content: file.name,
      timestamp: timestamp,
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      type: mediaType,
      media: {
        url: fileUrl,
        type: mediaType,
        filename: file.name,
        size: file.size
      }
    };
    
    // In a real app, we would wait for the upload to complete,
    // then update the conversation's last message
    setTimeout(() => {
      console.log(`Attachment ${mediaType} sent successfully:`, file.name);
    }, 1500);
    
    return newMessage;
  } catch (error) {
    console.error('Error sending attachment:', error);
    throw error;
  }
};
