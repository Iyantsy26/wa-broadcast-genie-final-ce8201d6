
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message } from "@/types/conversation";

export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        client_id,
        lead_id,
        last_message,
        last_message_timestamp,
        status,
        created_at,
        updated_at
      `)
      .order('last_message_timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }

    let clients = {};
    let leads = {};

    if (conversations?.some(c => c.client_id)) {
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name, avatar_url');
      
      if (clientsData) {
        clients = clientsData.reduce((acc, client) => {
          acc[client.id] = client;
          return acc;
        }, {});
      }
    }

    if (conversations?.some(c => c.lead_id)) {
      const { data: leadsData } = await supabase
        .from('leads')
        .select('id, name, avatar_url, phone');
      
      if (leadsData) {
        leads = leadsData.reduce((acc, lead) => {
          acc[lead.id] = lead;
          return acc;
        }, {});
      }
    }

    return (conversations || []).map(conv => {
      const isClient = !!conv.client_id;
      const contactId = isClient ? conv.client_id : conv.lead_id;
      const contactInfo = isClient ? clients[contactId] : leads[contactId];
      
      return {
        id: conv.id,
        contact: {
          id: contactId,
          name: contactInfo?.name || 'Unknown Contact',
          avatar: contactInfo?.avatar_url,
          phone: isClient ? '' : (contactInfo?.phone || ''),
          type: isClient ? 'client' : 'lead'
        },
        lastMessage: {
          content: conv.last_message || '',
          timestamp: conv.last_message_timestamp || conv.created_at,
          isOutbound: false,
          isRead: true
        },
        status: conv.status || 'new',
        chatType: isClient ? 'client' : 'lead'
      };
    });
  } catch (error) {
    console.error('Error in getConversations:', error);
    return [];
  }
};

export const getConversation = async (id: string): Promise<Conversation | null> => {
  try {
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
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }

    if (!data) return null;

    const isClient = !!data.client_id;
    const contactId = isClient ? data.client_id : data.lead_id;
    
    let contactInfo;
    if (isClient) {
      const { data: clientData } = await supabase
        .from('clients')
        .select('name, avatar_url')
        .eq('id', contactId)
        .single();
      contactInfo = clientData;
    } else {
      const { data: leadData } = await supabase
        .from('leads')
        .select('name, avatar_url, phone')
        .eq('id', contactId)
        .single();
      contactInfo = leadData;
    }
    
    return {
      id: data.id,
      contact: {
        id: contactId,
        name: contactInfo?.name || 'Unknown Contact',
        avatar: contactInfo?.avatar_url,
        phone: isClient ? '' : (contactInfo?.phone || ''),
        type: isClient ? 'client' : 'lead'
      },
      lastMessage: {
        content: data.last_message || '',
        timestamp: data.last_message_timestamp || data.created_at,
        isOutbound: false,
        isRead: true
      },
      status: data.status || 'new',
      chatType: isClient ? 'client' : 'lead'
    };
  } catch (error) {
    console.error('Error in getConversation:', error);
    return null;
  }
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

export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    // First delete all messages
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      throw messagesError;
    }

    // Then delete the conversation
    const { error: conversationError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (conversationError) {
      console.error('Error deleting conversation:', conversationError);
      throw conversationError;
    }
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    throw error;
  }
};

export const archiveConversation = async (conversationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ status: 'archived' })
      .eq('id', conversationId);

    if (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in archiveConversation:', error);
    throw error;
  }
};

export const addTagToConversation = async (conversationId: string, tag: string): Promise<void> => {
  try {
    // First get current tags if any
    const { data, error: fetchError } = await supabase
      .from('conversations')
      .select('tags')
      .eq('id', conversationId)
      .single();

    if (fetchError) {
      console.error('Error fetching conversation tags:', fetchError);
      throw fetchError;
    }

    // Prepare tags array (ensure it's an array)
    const currentTags = data.tags || [];
    const updatedTags = [...currentTags];
    
    // Add tag if not already present
    if (!updatedTags.includes(tag)) {
      updatedTags.push(tag);
    }

    // Update the conversation with new tags
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ tags: updatedTags })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation tags:', updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('Error in addTagToConversation:', error);
    throw error;
  }
};

export const assignConversation = async (conversationId: string, assignee: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ assigned_to: assignee })
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
