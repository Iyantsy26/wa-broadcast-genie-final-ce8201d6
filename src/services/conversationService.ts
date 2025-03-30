
import { v4 as uuidv4 } from 'uuid';
import { Conversation, Message, MessageStatus, MessageType } from '@/types/conversation';
import { supabase } from "@/integrations/supabase/client";

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
        updated_at,
        tags,
        assigned_to
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
        chatType: isClient ? 'client' : 'lead',
        tags: conv.tags || [],
        assignedTo: conv.assigned_to
      };
    });
  } catch (error) {
    console.error('Error in getConversations:', error);
    return [];
  }
};

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

export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    // First delete all messages associated with the conversation
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      throw messagesError;
    }

    // Then delete the conversation
    const { error: convError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (convError) {
      console.error('Error deleting conversation:', convError);
      throw convError;
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
      .update({
        status: 'archived'
      })
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
    // First get current tags
    const { data, error: fetchError } = await supabase
      .from('conversations')
      .select('tags')
      .eq('id', conversationId)
      .single();

    if (fetchError) {
      console.error('Error fetching conversation tags:', fetchError);
      throw fetchError;
    }

    const currentTags = data.tags || [];
    
    // Add new tag if it doesn't exist
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag];

      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          tags: newTags
        })
        .eq('id', conversationId);

      if (updateError) {
        console.error('Error updating tags:', updateError);
        throw updateError;
      }
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
      .update({
        assigned_to: assignee
      })
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
