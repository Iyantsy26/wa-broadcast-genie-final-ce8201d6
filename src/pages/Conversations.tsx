
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
import { importContactsFromTeam } from '@/services/contactService';

const Conversations = () => {
  const [selectedDevice, setSelectedDevice] = useState('1');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

        // Fetch team contacts
        console.log('Fetching team contacts...');
        const teamContacts = await importContactsFromTeam();
        console.log('Team contacts fetched:', teamContacts);

        // Combine all contacts
        const allContacts = [...leadContacts, ...clientContacts, ...teamContacts];
        console.log('All contacts combined:', allContacts);
        console.log('Team contacts count:', teamContacts.length);
        
        setContacts(allContacts);

        toast({
          title: 'Contacts loaded',
          description: `${allContacts.length} contacts loaded successfully (${teamContacts.length} team members)`,
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

  const handleTeamContactsImported = async (importedContacts: Contact[]) => {
    try {
      console.log('Handling team contacts import, received:', importedContacts);
      
      // Add the newly imported contacts to our state
      setContacts(prevContacts => {
        // Filter out existing team contacts to avoid duplicates
        const filteredContacts = prevContacts.filter(contact => 
          contact.type !== 'team' || !importedContacts.some(imp => imp.id === contact.id)
        );
        
        // Add the new imported contacts
        const updatedContacts = [...filteredContacts, ...importedContacts];
        console.log('Updated contacts state:', updatedContacts);
        console.log('Team contacts in updated list:', updatedContacts.filter(c => c.type === 'team').length);
        
        return updatedContacts;
      });
    } catch (error) {
      console.error('Error handling team contacts import:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh team contacts',
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
