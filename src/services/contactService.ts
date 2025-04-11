
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Contact } from "@/types/conversation";

export const blockContact = async (contactId: string, isBlocked: boolean): Promise<boolean> => {
  try {
    // For leads
    const { error: leadsError } = await supabase
      .from('leads')
      .update({ 
        // Store blocking status in the status field as a prefix
        status: isBlocked ? 'blocked' : 'active'
      })
      .eq('id', contactId);
    
    // For clients
    const { error: clientsError } = await supabase
      .from('clients')
      .update({ 
        // Store blocking status in the tags array
        tags: isBlocked ? ['blocked'] : []
      })
      .eq('id', contactId);
    
    if (leadsError && clientsError) {
      console.error('Failed to update contact blocking status:', leadsError, clientsError);
      return false;
    }
    
    toast.success(`Contact ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
    return true;
  } catch (error) {
    console.error('Error updating contact blocking status:', error);
    toast.error('Failed to update contact blocking status');
    return false;
  }
};

export const importContactsFromTeam = async (): Promise<Contact[]> => {
  try {
    // Get team members
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*');
      
    if (teamError) {
      throw teamError;
    }
    
    if (!teamMembers || teamMembers.length === 0) {
      return [];
    }
    
    // Convert team members to contacts
    const contacts: Contact[] = teamMembers.map(member => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      phone: member.phone || '',
      type: 'team',
      isOnline: member.status === 'active',
      lastSeen: member.last_active || new Date().toISOString(),
      role: member.role,
      tags: []
    }));
    
    // Update conversations table to include these team members
    for (const contact of contacts) {
      // Check if conversation already exists for this team member
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('team_member_id', contact.id)
        .maybeSingle();
      
      // If not, create a new conversation entry
      if (!existingConv) {
        await supabase
          .from('conversations')
          .insert({
            team_member_id: contact.id,
            status: 'active',
            last_message: 'Conversation started',
            last_message_timestamp: new Date().toISOString()
          });
      }
    }
    
    toast.success(`Imported ${contacts.length} team contacts`);
    return contacts;
  } catch (error) {
    console.error('Error importing team contacts:', error);
    toast.error('Failed to import team contacts');
    return [];
  }
};
