
import { Conversation } from '@/types/conversation';
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

    let clients: Record<string, any> = {};
    let leads: Record<string, any> = {};

    if (conversations?.some(c => c.client_id)) {
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name, avatar_url, phone, tags');
      
      if (clientsData) {
        clients = clientsData.reduce((acc: Record<string, any>, client: any) => {
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
        leads = leadsData.reduce((acc: Record<string, any>, lead: any) => {
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
          phone: contactInfo?.phone || '',
          type: isClient ? 'client' : 'lead',
          tags: contactInfo?.tags || []
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
        assignedTo: conv.assigned_to,
        isPinned: false,
        isArchived: false,
        unreadCount: 0
      };
    });
  } catch (error) {
    console.error('Error in getConversations:', error);
    return [];
  }
};
