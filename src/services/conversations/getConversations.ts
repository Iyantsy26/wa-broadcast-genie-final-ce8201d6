
import { Conversation, ChatType } from '@/types/conversation';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches conversations from the database
 */
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    // Fetch conversations
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        client_id,
        lead_id,
        status,
        last_message,
        last_message_timestamp,
        assigned_to,
        tags,
        created_at,
        updated_at
      `)
      .order('last_message_timestamp', { ascending: false });

    if (error) throw error;

    // Prepare to transform the conversations
    const transformedConversations = await Promise.all(
      conversations.map(async (conv) => {
        let contactData;
        let contactType: ChatType;
        
        // Determine if this is a client or lead conversation
        if (conv.client_id) {
          const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('id, name, avatar_url, phone')
            .eq('id', conv.client_id)
            .single();
          
          if (clientError) console.error('Error fetching client:', clientError);
          
          contactData = client;
          contactType = 'client';
        } else {
          // Must be a lead
          const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('id, name, avatar_url, phone')
            .eq('id', conv.lead_id)
            .single();
          
          if (leadError) console.error('Error fetching lead:', leadError);
          
          contactData = lead;
          contactType = 'lead';
        }

        // Ensure that the contact data has a valid id
        const contactId = contactData?.id || (conv.client_id || conv.lead_id);
        
        // Return a properly formatted Conversation object
        return {
          id: conv.id,
          contact: {
            id: contactId,
            name: contactData?.name || 'Unknown Contact',
            avatar: contactData?.avatar_url,
            phone: contactData?.phone || '',
            type: contactType,
            tags: [], // Default empty tags array
          },
          lastMessage: {
            content: conv.last_message || '',
            timestamp: conv.last_message_timestamp || conv.created_at,
            isOutbound: false,
            isRead: true,
          },
          status: conv.status || 'new',
          chatType: contactType,
          tags: conv.tags || [],
          assignedTo: conv.assigned_to,
          isPinned: false,
          isArchived: false,
          unreadCount: 0,
        };
      })
    );

    return transformedConversations;
  } catch (error) {
    console.error('Error in getConversations:', error);
    return [];
  }
};
