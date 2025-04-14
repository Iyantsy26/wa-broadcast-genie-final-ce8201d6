
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Users } from 'lucide-react';
import { Contact } from '@/types/conversation';
import { toast } from '@/hooks/use-toast';
import { importContactsFromTeam } from '@/services/contactService';
import { Badge } from "@/components/ui/badge";

interface TeamContactImportProps {
  onImportComplete: (contacts: Contact[]) => void;
}

export const TeamContactImport: React.FC<TeamContactImportProps> = ({ onImportComplete }) => {
  const [loading, setLoading] = useState(false);
  const [teamCount, setTeamCount] = useState(0);
  
  // Auto-import on component mount
  useEffect(() => {
    handleImport();
  }, []);

  const handleImport = async () => {
    try {
      setLoading(true);
      toast({
        title: 'Importing team contacts',
        description: 'Please wait while we import your team contacts...',
      });
      
      // Use the service to import contacts and get the returned contacts
      const importedContacts = await importContactsFromTeam();
      
      // Process the contacts with validated data
      const validatedContacts = importedContacts.map(contact => ({
        ...contact,
        type: 'team' as const, // Explicitly set as team type with const assertion
        // Ensure avatar field has a valid URL or set to empty string
        avatar: contact.avatar && 
               typeof contact.avatar === 'string' && 
               (contact.avatar.startsWith('http') || contact.avatar.startsWith('/')) ? 
               contact.avatar : ''
      }));
      
      // Set the team count
      setTeamCount(validatedContacts.length);
      
      if (validatedContacts.length === 0) {
        console.warn('No team contacts were imported. Check your team_members table in Supabase.');
        toast({
          title: 'No team contacts found',
          description: 'No team contacts were found in your database.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      // Call the callback to notify parent component with the imported contacts
      onImportComplete(validatedContacts);
      
      toast({
        title: 'Team contacts imported',
        description: `${validatedContacts.length} team contacts imported successfully.`,
      });
    } catch (error) {
      console.error('Error importing team contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to import team contacts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        onClick={handleImport} 
        className="flex items-center gap-2"
        disabled={loading}
      >
        <Users className="h-4 w-4" />
        <span>{loading ? 'Refreshing...' : 'Refresh Team'}</span>
      </Button>
      {teamCount > 0 && (
        <Badge variant="secondary" className="h-6">
          {teamCount}
        </Badge>
      )}
    </div>
  );
};
