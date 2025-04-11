
import React, { useState, useEffect } from 'react';
import { ConversationProvider } from '@/contexts/ConversationContext';
import ConversationLayout from '@/components/conversations/ConversationLayout';
import DeviceSelector from '@/components/conversations/DeviceSelector';
import { getLeads } from '@/services/leadService';
import { getClients } from '@/services/clientService';
import { getConversations } from '@/services/conversationService';
import { Contact } from '@/types/conversation';
import { toast } from '@/hooks/use-toast';
import { TeamContactImport } from '@/components/conversations/TeamContactImport';
import { supabase } from '@/integrations/supabase/client';

const Conversations = () => {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const { data, error } = await supabase
          .from('device_accounts')
          .select('id, name')
          .eq('status', 'connected')
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSelectedDevice(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };
    
    fetchDevices();
  }, []);

  useEffect(() => {
    async function fetchContactsFromAllSources() {
      try {
        setIsLoading(true);
        
        // Fetch leads
        const leads = await getLeads();
        const leadContacts: Contact[] = leads.map(lead => ({
          id: lead.id,
          name: lead.name,
          avatar: lead.avatar_url,
          phone: lead.phone || '',
          type: 'lead' as const,
          isOnline: false,
          lastSeen: lead.last_contact || new Date().toISOString(),
          tags: lead.status ? [lead.status] : []
        }));
        
        // Fetch clients
        const clients = await getClients();
        const clientContacts: Contact[] = clients.map(client => ({
          id: client.id,
          name: client.name,
          avatar: client.avatar_url,
          phone: client.phone || '',
          type: 'client' as const,
          isOnline: false,
          lastSeen: client.join_date || new Date().toISOString(),
          tags: client.tags || []
        }));

        // Fetch team members
        const { data: teamMembers, error: teamError } = await supabase
          .from('team_members')
          .select('*')
          .eq('status', 'active');

        if (teamError) throw teamError;

        // Convert to contacts
        const teamContacts: Contact[] = (teamMembers || []).map(member => ({
          id: member.id,
          name: member.name,
          avatar: member.avatar,
          phone: member.phone || '',
          type: 'team' as const,
          isOnline: true,
          lastSeen: member.last_active || new Date().toISOString(),
          role: member.role,
          tags: []
        }));

        // Combine all contacts
        const allContacts = [...leadContacts, ...clientContacts, ...teamContacts];
        setContacts(allContacts);

        toast({
          title: 'Contacts loaded',
          description: `${allContacts.length} contacts loaded successfully`,
        });
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load contacts',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchContactsFromAllSources();
  }, []);

  const handleTeamContactsImported = (importedContacts: Contact[]) => {
    // Add the newly imported contacts to our state
    setContacts(prevContacts => {
      // Filter out existing team contacts with the same IDs to avoid duplicates
      const existingIds = new Set(prevContacts.filter(c => c.type === 'team').map(c => c.id));
      const newContacts = importedContacts.filter(c => !existingIds.has(c.id));
      
      if (newContacts.length === 0) {
        toast({
          title: 'No new contacts',
          description: 'All team contacts have already been imported',
        });
        return prevContacts;
      }
      
      toast({
        title: 'Team contacts imported',
        description: `${newContacts.length} team contacts imported successfully`,
      });
      
      return [...prevContacts, ...newContacts];
    });
  };

  return (
    <ConversationProvider initialContacts={contacts}>
      <div className="flex flex-col h-full space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
            <p className="text-muted-foreground">
              Manage all your conversations in one place
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <TeamContactImport onImportComplete={handleTeamContactsImported} />
            <DeviceSelector 
              selectedDevice={selectedDevice}
              onSelectDevice={setSelectedDevice}
            />
          </div>
        </div>
        
        <div className="flex-1">
          <ConversationLayout currentDeviceId={selectedDevice} />
        </div>
      </div>
    </ConversationProvider>
  );
};

export default Conversations;
