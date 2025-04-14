
import { Conversation, Contact, ChatType } from '@/types/conversation';
import { supabase } from "@/integrations/supabase/client";
import { getLeads } from '../leadService';
import { getClients } from '../clientService';
import { importContactsFromTeam } from '../contactService';

export const getConversations = async (): Promise<Conversation[]> => {
  try {
    console.log('Fetching conversations from all sources...');
    
    // Get data from all sources
    const leads = await getLeads();
    console.log(`Fetched ${leads.length} leads`);
    
    const clients = await getClients();
    console.log(`Fetched ${clients.length} clients`);
    
    const teamContacts = await importContactsFromTeam();
    console.log(`Fetched ${teamContacts.length} team contacts`);
    
    if (teamContacts.length === 0) {
      console.warn('No team contacts were found. Verify team_members table in Supabase has active members.');
    }
    
    // Create lead conversations
    const leadConversations = leads.map(lead => {
      const contact: Contact = {
        id: lead.id,
        name: lead.name,
        avatar: lead.avatar_url || '',
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
      } as Conversation;
    });
    
    console.log(`Created ${leadConversations.length} lead conversations`);
    
    // Create client conversations
    const clientConversations = clients.map(client => {
      const contact: Contact = {
        id: client.id,
        name: client.name,
        avatar: client.avatar_url || '',
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
      } as Conversation;
    });
    
    console.log(`Created ${clientConversations.length} client conversations`);

    // Create team member conversations with improved handling
    const teamConversations = teamContacts.map((member) => {
      // Ensure consistent contact structure for team members
      const contact: Contact = {
        id: member.id,
        name: member.name,
        avatar: '', // Explicitly empty to prevent 404 errors
        phone: member.phone || '',
        type: 'team' as ChatType,
        isOnline: member.isOnline !== undefined ? member.isOnline : true,
        lastSeen: member.lastSeen || new Date().toISOString(),
        role: member.role || 'Team Member',
        tags: member.tags || []
      };

      return {
        id: `team-conversation-${member.id}`,
        contact,
        lastMessage: {
          content: `Team chat with ${member.role || 'Team Member'}`,
          timestamp: new Date().toISOString(),
          isOutbound: false,
          isRead: true
        },
        status: 'open',
        chatType: 'team' as ChatType,
        tags: [],
        assignedTo: '',
        isEncrypted: false,
        isPinned: false,
        isArchived: false,
        unreadCount: 0
      } as Conversation;
    });
    
    console.log(`Created ${teamConversations.length} team conversations`);
    
    // Combine and return all conversations
    const allConversations = [...leadConversations, ...clientConversations, ...teamConversations];
    console.log(`Total conversations: ${allConversations.length}`);
    console.log('Conversation types:', {
      leads: allConversations.filter(c => c.chatType === 'lead').length,
      clients: allConversations.filter(c => c.chatType === 'client').length,
      team: allConversations.filter(c => c.chatType === 'team').length
    });
    
    return allConversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};
