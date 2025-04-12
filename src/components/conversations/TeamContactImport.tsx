
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Users } from 'lucide-react';
import { Contact } from '@/types/conversation';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { importContactsFromTeam } from '@/services/contactService';

interface TeamContactImportProps {
  onImportComplete: (contacts: Contact[]) => void;
}

export const TeamContactImport: React.FC<TeamContactImportProps> = ({ onImportComplete }) => {
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    try {
      setLoading(true);
      
      // Use the service to import contacts and get the returned contacts
      const importedContacts = await importContactsFromTeam();
      
      console.log('Team contacts imported successfully:', importedContacts);
      
      // Call the callback to notify parent component with the imported contacts
      onImportComplete(importedContacts);
      
      toast({
        title: 'Team contacts imported',
        description: `${importedContacts.length} team contacts imported successfully`,
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
    <Button 
      variant="outline" 
      onClick={handleImport} 
      className="flex items-center gap-2"
      disabled={loading}
    >
      <Users className="h-4 w-4" />
      <span>{loading ? 'Refreshing...' : 'Refresh Team'}</span>
    </Button>
  );
};
