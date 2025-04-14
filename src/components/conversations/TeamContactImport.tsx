
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus } from 'lucide-react';
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
  
  const handleImport = async () => {
    try {
      setLoading(true);
      toast({
        title: 'Importing team contacts',
        description: 'Please wait while we import your team contacts...',
      });
      
      // Import contacts from the team_members table
      const importedContacts = await importContactsFromTeam();
      
      // Ensure each contact has the correct structure
      const validatedContacts = importedContacts.map(contact => ({
        ...contact,
        type: 'team' as const,
        avatar: '', // Explicitly set empty avatar to prevent 404 errors
        tags: contact.tags || []
      }));
      
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
        description: `${validatedContacts.length} team members imported to team chat successfully.`,
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
        <UserPlus className="h-4 w-4" />
        <span>{loading ? 'Importing...' : 'Import Team'}</span>
      </Button>
      {teamCount > 0 && (
        <Badge variant="secondary" className="h-6">
          {teamCount}
        </Badge>
      )}
    </div>
  );
};
