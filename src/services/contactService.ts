
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Contact, ChatType } from "@/types/conversation";

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
    console.log('Importing team contacts from Supabase...');
    
    // Get team members with all necessary fields
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('id, name, phone, role, email, status, last_active, position')
      .eq('status', 'active');
      
    if (teamError) {
      console.error('Error fetching team members:', teamError);
      throw teamError;
    }
    
    if (!teamMembers || teamMembers.length === 0) {
      console.log('No team members found to import');
      return [];
    }
    
    console.log('Team members fetched successfully:', teamMembers.length);
    
    // Convert team members to contacts with proper structure
    const contacts: Contact[] = teamMembers.map((member) => {
      const contact: Contact = {
        id: member.id,
        name: member.name || 'Team Member',
        avatar: '', // Set empty avatar to avoid 404 errors
        phone: member.phone || '',
        type: 'team' as ChatType,
        isOnline: member.status === 'active',
        lastSeen: member.last_active || new Date().toISOString(),
        role: member.role || member.position,
        tags: [],
        email: member.email
      };
      
      return contact;
    });
    
    console.log('Converted team members to contacts:', contacts.length);
    
    return contacts;
  } catch (error) {
    console.error('Error importing team contacts:', error);
    throw error;
  }
};
