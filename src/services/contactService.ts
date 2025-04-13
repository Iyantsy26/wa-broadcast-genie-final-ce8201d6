
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
    
    // Get team members - make sure we're selecting all the required fields
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('id, name, avatar, phone, role, status, last_active')
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
    
    // Convert team members to contacts
    const contacts: Contact[] = teamMembers.map((member, index) => {
      // Validate avatar URL - ensure it exists and is a valid URL
      let avatarUrl = '';
      if (member.avatar) {
        try {
          // Only set the avatar URL if it's a valid URL or path
          if (member.avatar.startsWith('http') || member.avatar.startsWith('/')) {
            avatarUrl = member.avatar;
          } else {
            console.warn(`Invalid avatar URL format for team member ${member.id}: ${member.avatar}`);
          }
        } catch (e) {
          console.warn(`Error processing avatar URL for team member ${member.id}:`, e);
        }
      }
      
      const contact: Contact = {
        id: member.id,
        name: member.name || `Team Member ${index + 1}`,
        avatar: avatarUrl, // Use the validated avatar URL
        phone: member.phone || '',
        type: 'team' as ChatType, // Explicitly set as team type
        isOnline: member.status === 'active',
        lastSeen: member.last_active || new Date().toISOString(),
        role: member.role,
        tags: []
      };
      
      return contact;
    });
    
    console.log('Converted team members to contacts:', contacts.length);
    console.log('Team contact types:', contacts.map(c => c.type));
    
    return contacts;
  } catch (error) {
    console.error('Error importing team contacts:', error);
    throw error; // Rethrow to allow handling in the component
  }
};
