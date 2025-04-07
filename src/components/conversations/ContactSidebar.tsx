
import React from 'react';
import { Contact } from '@/types/conversation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter } from 'lucide-react';
import ContactItem from './ContactItem';

interface ContactSidebarProps {
  contacts: Contact[];
  onSelectContact: (contactId: string) => void;
  selectedContactId: string | null;
  isSidebarOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
}

const ContactSidebar: React.FC<ContactSidebarProps> = ({
  contacts,
  onSelectContact,
  selectedContactId,
  onClose
}) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Contacts</h3>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contacts" className="pl-8" />
        </div>
      </div>
      
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">All</Button>
          <Button variant="ghost" size="sm">Clients</Button>
          <Button variant="ghost" size="sm">Leads</Button>
        </div>
        <Button variant="ghost" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {contacts && contacts.length > 0 ? (
            contacts.map((contact) => (
              <ContactItem
                key={contact.id}
                contact={contact}
                isSelected={contact.id === selectedContactId}
                onClick={() => onSelectContact(contact.id)}
              />
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <p>No contacts found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ContactSidebar;
