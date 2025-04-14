
import React, { useState, useEffect } from 'react';
import { ConversationProvider } from '@/contexts/ConversationContext';
import ConversationLayout from '@/components/conversations/ConversationLayout';
import DeviceSelector from '@/components/conversations/DeviceSelector';
import { getLeads } from '@/services/leadService';
import { getClients } from '@/services/clientService';
import { Contact, ChatType } from '@/types/conversation';
import { toast } from '@/hooks/use-toast';
import { TeamContactImport } from '@/components/conversations/TeamContactImport';
import { supabase } from '@/integrations/supabase/client';

const Conversations = () => {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get available devices to initialize with a valid one
    const fetchDevices = async () => {
      try {
        const { data, error } = await supabase
          .from('device_accounts')
          .select('id');
        
        if (error) {
          console.error('Error fetching devices:', error);
          return;
        }
        
        if (data && data.length > 0) {
          setSelectedDevice(data[0].id);
        }
      } catch (error) {
        console.error('Error in fetchDevices:', error);
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
          avatar: lead.avatar_url || '',
          phone: lead.phone || '',
          type: 'lead' as ChatType,
          isOnline: false,
          lastSeen: lead.last_contact || new Date().toISOString(),
          tags: lead.status ? [lead.status] : []
        }));
        
        // Fetch clients
        const clients = await getClients();
        const clientContacts: Contact[] = clients.map(client => ({
          id: client.id,
          name: client.name,
          avatar: client.avatar_url || '',
          phone: client.phone || '',
          type: 'client' as ChatType,
          isOnline: false,
          lastSeen: client.join_date || new Date().toISOString(),
          tags: client.tags || []
        }));
        
        // Combine leads and clients
        const initialContacts = [...leadContacts, ...clientContacts];
        setContacts(initialContacts);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load contacts',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    }

    fetchContactsFromAllSources();
  }, []);

  const handleTeamContactsImported = async (importedContacts: Contact[]) => {
    try {
      console.log('Handling team contacts import, received:', importedContacts.length);
      
      // Add the newly imported contacts to our state
      setContacts(prevContacts => {
        // Filter out existing team contacts to avoid duplicates
        const filteredContacts = prevContacts.filter(contact => 
          contact.type !== 'team'
        );
        
        // Ensure each imported contact has consistent structure
        const formattedTeamContacts = importedContacts.map(contact => ({
          ...contact,
          type: 'team' as ChatType,
          avatar: '', // Explicitly empty to prevent 404 errors
          tags: contact.tags || []
        }));
        
        // Add the formatted imported contacts
        const updatedContacts = [...filteredContacts, ...formattedTeamContacts];
        console.log('Updated contacts state:', updatedContacts.length);
        
        return updatedContacts;
      });
      
      // Inform user about the action
      toast({
        title: 'Team Members Imported',
        description: `${importedContacts.length} team members are now available in team chat`,
      });
    } catch (error) {
      console.error('Error handling team contacts import:', error);
      toast({
        title: 'Error',
        description: 'Failed to import team contacts',
        variant: 'destructive',
      });
    }
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
