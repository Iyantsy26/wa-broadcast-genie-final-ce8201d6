
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message } from "@/types/conversation";

export const getConversations = async (): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      client_id,
      lead_id,
      last_message,
      last_message_timestamp,
      status,
      created_at,
      updated_at,
      clients(name, avatar_url),
      leads(name, avatar_url)
    `)
    .order('last_message_timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }

  // Transform the data to match our Conversation type
  return (data || []).map(conv => {
    const isClient = !!conv.client_id;
    
    // Safely handle the potential null/undefined cases
    // Use optional chaining to safely access nested properties
    const contactData = isClient ? conv.clients : conv.leads;
    
    // Default values if data is missing
    const contactName = contactData && 'name' in contactData ? contactData.name : 'Unknown';
    const contactAvatar = contactData && 'avatar_url' in contactData ? contactData.avatar_url : undefined;
    
    return {
      id: conv.id,
      contact: {
        id: isClient ? conv.client_id : conv.lead_id,
        name: contactName || 'Unknown',
        avatar: contactAvatar,
        phone: '', // We'll need to add this later
        type: isClient ? 'client' : 'lead'
      },
      lastMessage: {
        content: conv.last_message || '',
        timestamp: conv.last_message_timestamp,
        isOutbound: false, // We'll need to add this information to the database
        isRead: true // We'll need to add this information to the database
      },
      status: conv.status as 'new' | 'active' | 'resolved' | 'waiting',
      chatType: isClient ? 'client' : 'lead'
    };
  });
};

export const getConversation = async (id: string): Promise<Conversation | null> => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      client_id,
      lead_id,
      last_message,
      last_message_timestamp,
      status,
      created_at,
      updated_at,
      clients(name, avatar_url),
      leads(name, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }

  if (!data) return null;

  const isClient = !!data.client_id;
  const contactData = isClient ? data.clients : data.leads;
  
  // Safely handle the potential null/undefined cases
  const contactName = contactData && 'name' in contactData ? contactData.name : 'Unknown';
  const contactAvatar = contactData && 'avatar_url' in contactData ? contactData.avatar_url : undefined;
  
  return {
    id: data.id,
    contact: {
      id: isClient ? data.client_id : data.lead_id,
      name: contactName || 'Unknown',
      avatar: contactAvatar,
      phone: '', // We'll need to add this later
      type: isClient ? 'client' : 'lead'
    },
    lastMessage: {
      content: data.last_message || '',
      timestamp: data.last_message_timestamp,
      isOutbound: false, // We'll need to add this information to the database
      isRead: true // We'll need to add this information to the database
    },
    status: data.status as 'new' | 'active' | 'resolved' | 'waiting',
    chatType: isClient ? 'client' : 'lead'
  };
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
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
    isOutbound: msg.is_outbound,
    status: msg.status as any,
    sender: msg.sender,
    type: msg.message_type as any,
    ...(msg.media_url && {
      media: {
        url: msg.media_url,
        type: msg.media_type as any,
        filename: msg.media_filename,
        duration: msg.media_duration
      }
    })
  }));
};

export const sendMessage = async (
  conversationId: string, 
  message: Omit<Message, 'id'>
): Promise<Message> => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      conversation_id: conversationId,
      content: message.content,
      is_outbound: message.isOutbound,
      timestamp: message.timestamp,
      status: message.status,
      sender: message.sender,
      message_type: message.type,
      media_url: message.media?.url,
      media_type: message.media?.type,
      media_filename: message.media?.filename,
      media_duration: message.media?.duration
    }])
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  // Update the last message in the conversation
  await supabase
    .from('conversations')
    .update({
      last_message: message.content || (message.media ? 'Attachment' : ''),
      last_message_timestamp: message.timestamp
    })
    .eq('id', conversationId);

  return {
    id: data.id,
    content: data.content || '',
    timestamp: data.timestamp,
    isOutbound: data.is_outbound,
    status: data.status as any,
    sender: data.sender,
    type: data.message_type as any,
    ...(data.media_url && {
      media: {
        url: data.media_url,
        type: data.media_type as any,
        filename: data.media_filename,
        duration: data.media_duration
      }
    })
  };
};

export const createConversation = async (
  contactId: string,
  contactType: 'client' | 'lead',
  initialMessage: string
): Promise<string> => {
  // Create the conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert([{
      client_id: contactType === 'client' ? contactId : null,
      lead_id: contactType === 'lead' ? contactId : null,
      last_message: initialMessage,
      last_message_timestamp: new Date().toISOString(),
      status: 'new'
    }])
    .select()
    .single();

  if (convError) {
    console.error('Error creating conversation:', convError);
    throw convError;
  }

  // Create the initial message
  const { error: msgError } = await supabase
    .from('messages')
    .insert([{
      conversation_id: conversation.id,
      content: initialMessage,
      is_outbound: true,
      timestamp: new Date().toISOString(),
      status: 'sent',
      sender: 'You',
      message_type: 'text'
    }]);

  if (msgError) {
    console.error('Error creating initial message:', msgError);
    throw msgError;
  }

  return conversation.id;
};
