
import { Conversation, ChatType } from '@/types/conversation';
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
      const chatType = isClient ? 'client' : 'lead';
      
      return {
        id: conv.id,
        contact: {
          id: contactId,
          name: contactInfo?.name || 'Unknown Contact',
          avatar: contactInfo?.avatar_url,
          phone: isClient ? '' : (contactInfo?.phone || ''),
          type: isClient ? 'client' : 'lead',
          tags: [] // Added empty tags array to satisfy the Contact type
        },
        lastMessage: conv.last_message || '',
        lastMessageTimestamp: conv.last_message_timestamp || conv.created_at,
        status: conv.status || 'new',
        chatType: chatType,
        tags: conv.tags || [],
        assignedTo: conv.assigned_to
      };
    });
  } catch (error) {
    console.error('Error in getConversations:', error);
    return [];
  }
};
