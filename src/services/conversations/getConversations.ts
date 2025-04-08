
import { Conversation, Contact, ChatType } from '@/types/conversation';
import { supabase } from "@/integrations/supabase/client";
import { getLeads } from '../leadService';
import { getClients } from '../clientService';

export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const leads = await getLeads();
    const clients = await getClients();
    
    // Create lead conversations
    const leadConversations = leads.map(lead => {
      const contact: Contact = {
        id: lead.id,
        name: lead.name,
        avatar: lead.avatar_url,
        phone: lead.phone || '',
        type: 'lead' as ChatType,
        isOnline: Math.random() > 0.7, // Random online status for demo
        lastSeen: lead.last_contact || new Date().toISOString(),
        tags: lead.status ? [lead.status] : []
      };
      
      return {
        id: `lead-conversation-${lead.id}`,
        contact,
        lastMessage: {
          content: 'This is the last message from this lead',
          timestamp: new Date().toISOString(),
          isOutbound: false,
          isRead: true
        },
        status: 'open',
        chatType: 'lead' as ChatType,
        tags: lead.status ? [lead.status] : [],
        assignedTo: '',
        isEncrypted: false,
        isPinned: false,
        isArchived: false,
        unreadCount: 0
      };
    });
    
    // Create client conversations
    const clientConversations = clients.map(client => {
      const contact: Contact = {
        id: client.id,
        name: client.name,
        avatar: client.avatar_url,
        phone: client.phone || '',
        type: 'client' as ChatType,
        isOnline: Math.random() > 0.7, // Random online status for demo
        lastSeen: new Date().toISOString(),
        tags: client.tags || []
      };
      
      return {
        id: `client-conversation-${client.id}`,
        contact,
        lastMessage: {
          content: 'This is the last message from this client',
          timestamp: new Date().toISOString(),
          isOutbound: false,
          isRead: true
        },
        status: 'open',
        chatType: 'client' as ChatType,
        tags: client.tags || [],
        assignedTo: '',
        isEncrypted: false,
        isPinned: false,
        isArchived: false,
        unreadCount: 0
      };
    });
    
    // Combine and return all conversations
    return [...leadConversations, ...clientConversations];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};
