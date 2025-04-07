
import { Message } from '@/types/conversation';

export const sendLocationMessage = async (
  conversationId: string,
  latitude: number,
  longitude: number,
  deviceId: string
): Promise<Message> => {
  try {
    const timestamp = new Date().toISOString();
    const messageId = `location_${Date.now()}`;
    
    const message: Message = {
      id: messageId,
      content: 'Shared location',
      timestamp: timestamp,
      isOutbound: true,
      status: 'sent',
      sender: 'You',
      type: 'location',
      location: {
        latitude,
        longitude
      }
    };
    
    console.log(`Location shared at: ${latitude}, ${longitude}`);
    return message;
  } catch (error) {
    console.error('Error sending location:', error);
    throw error;
  }
};
