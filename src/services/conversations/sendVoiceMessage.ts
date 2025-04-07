
import { Message } from '@/types/conversation';

export const sendVoiceMessage = async (
  conversationId: string,
  durationInSeconds: number,
  deviceId: string
): Promise<Message> => {
  try {
    const timestamp = new Date().toISOString();
    const messageId = `voice_${Date.now()}`;
    
    // In a real app, this would include the actual voice recording
    const message: Message = {
      id: messageId,
      content: '',
      timestamp: timestamp,
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      type: 'voice',
      media: {
        url: '#',  // In a real app, this would be the URL to the voice recording
        type: 'voice',
        duration: durationInSeconds
      }
    };
    
    console.log(`Voice message sent (${durationInSeconds}s)`);
    return message;
  } catch (error) {
    console.error('Error sending voice message:', error);
    throw error;
  }
};
