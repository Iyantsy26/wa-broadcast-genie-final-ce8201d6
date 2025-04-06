import React, { useState } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import {
  Search,
  Filter,
  PlusCircle,
  Star,
  MessagesSquare,
  User,
  Briefcase,
  Phone,
  X
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContactItem from './ContactItem';
import { ChatType } from '@/types/conversation';
import NewContactDialog from './dialogs/NewContactDialog';

interface NewContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactCreated: (name: string, phone: string, type: ChatType) => void;
}

const ContactSidebar = () => {
  const {
    contacts,
    selectedContactId,
    contactFilter,
    searchTerm,
    messages,
    selectContact,
    setContactFilter,
    setSearchTerm
  } = useConversation();
  
  const [showNewContactDialog, setShowNewContactDialog] = useState(false);
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  
  // Filter and group contacts
  const filteredContacts = contacts.filter(contact => {
    // Filter by type
    if (contactFilter !== 'all' && contact.type !== contactFilter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !contact.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Don't show archived or blocked contacts
    if (contact.isArchived || contact.isBlocked) {
      return false;
    }
    
    return true;
  });
  
  // Group by type
  const starredContacts = filteredContacts.filter(c => c.isStarred);
  const teamContacts = filteredContacts.filter(c => c.type === 'team');
  const clientContacts = filteredContacts.filter(c => c.type === 'client');
  const leadContacts = filteredContacts.filter(c => c.type === 'lead');
  
  // Get unread count for tab badges
  const getUnreadCount = (type: ChatType) => {
    return contacts.filter(c => 
      c.type === type &&
      !c.isArchived &&
      !c.isBlocked &&
      messages[c.id]?.some(m => !m.isOutbound && m.status !== 'read')
    ).length;
  };
  
  const teamUnread = getUnreadCount('team');
  const clientUnread = getUnreadCount('client');
  const leadUnread = getUnreadCount('lead');
  
  return (
    <div className="w-80 flex flex-col bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Header with search */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 w-10"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => setContactFilter('all')}>
                  <MessagesSquare className="mr-2 h-4 w-4" />
                  <span>All conversations</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSearchTerm('')}>
                  <X className="mr-2 h-4 w-4" />
                  <span>Clear filters</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setShowAddContactDialog(true)} size="icon">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Conversation type tabs */}
        <Tabs
          defaultValue="all"
          value={contactFilter}
          onValueChange={(value) => setContactFilter(value as ChatType | 'all')}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all" className="relative">
              <MessagesSquare className="h-4 w-4 mr-1" />
              All
            </TabsTrigger>
            <TabsTrigger value="team" className="relative">
              <User className="h-4 w-4 mr-1" />
              Team
              {teamUnread > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                  {teamUnread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="client" className="relative">
              <Briefcase className="h-4 w-4 mr-1" />
              Clients
              {clientUnread > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                  {clientUnread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="lead" className="relative">
              <Phone className="h-4 w-4 mr-1" />
              Leads
              {leadUnread > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                  {leadUnread}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Contact list */}
      <ScrollArea className="flex-1">
        {searchTerm && (
          <div className="py-2 px-3 text-xs text-muted-foreground">
            Search results for "{searchTerm}"
          </div>
        )}
        
        {/* Starred contacts */}
        {starredContacts.length > 0 && (
          <div className="mb-2">
            <div className="px-4 py-2 text-xs font-semibold flex items-center">
              <Star className="h-3 w-3 mr-1 text-yellow-400" />
              Starred
            </div>
            {starredContacts.map(contact => (
              <ContactItem
                key={contact.id}
                contact={contact}
                messages={messages[contact.id] || []}
                isActive={contact.id === selectedContactId}
                onClick={() => selectContact(contact.id)}
              />
            ))}
          </div>
        )}
        
        {/* Team contacts */}
        {teamContacts.length > 0 && contactFilter !== 'client' && contactFilter !== 'lead' && (
          <div className="mb-2">
            <div className="px-4 py-2 text-xs font-semibold flex items-center">
              <User className="h-3 w-3 mr-1 text-indigo-500" />
              Team Members
            </div>
            {teamContacts.map(contact => (
              <ContactItem
                key={contact.id}
                contact={contact}
                messages={messages[contact.id] || []}
                isActive={contact.id === selectedContactId}
                onClick={() => selectContact(contact.id)}
              />
            ))}
          </div>
        )}
        
        {/* Client contacts */}
        {clientContacts.length > 0 && contactFilter !== 'team' && contactFilter !== 'lead' && (
          <div className="mb-2">
            <div className="px-4 py-2 text-xs font-semibold flex items-center">
              <Briefcase className="h-3 w-3 mr-1 text-emerald-500" />
              Clients
            </div>
            {clientContacts.map(contact => (
              <ContactItem
                key={contact.id}
                contact={contact}
                messages={messages[contact.id] || []}
                isActive={contact.id === selectedContactId}
                onClick={() => selectContact(contact.id)}
              />
            ))}
          </div>
        )}
        
        {/* Lead contacts */}
        {leadContacts.length > 0 && contactFilter !== 'team' && contactFilter !== 'client' && (
          <div className="mb-2">
            <div className="px-4 py-2 text-xs font-semibold flex items-center">
              <Phone className="h-3 w-3 mr-1 text-amber-500" />
              Leads
            </div>
            {leadContacts.map(contact => (
              <ContactItem
                key={contact.id}
                contact={contact}
                messages={messages[contact.id] || []}
                isActive={contact.id === selectedContactId}
                onClick={() => selectContact(contact.id)}
              />
            ))}
          </div>
        )}
        
        {/* No results */}
        {filteredContacts.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">No contacts found</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSearchTerm('');
                setContactFilter('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </ScrollArea>
      
      {showAddContactDialog && (
        <NewContactDialog 
          open={showAddContactDialog}
          onOpenChange={setShowAddContactDialog}
          onContactCreated={(name, phone, type) => {
            handleAddContact({
              name,
              phone,
              type
            });
          }}
        />
      )}
    </div>
  );
};

export default ContactSidebar;
