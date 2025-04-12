
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Contact } from '@/types/conversation';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { importContactsFromTeam } from '@/services/contactService';

interface TeamContactImportProps {
  onImportComplete: () => void;
}

export const TeamContactImport: React.FC<TeamContactImportProps> = ({ onImportComplete }) => {
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    try {
      setLoading(true);
      
      // Use the service to import contacts
      await importContactsFromTeam();
      
      // Call the callback to notify parent component
      onImportComplete();
      
      toast({
        title: 'Team contacts imported',
        description: `Team contacts imported successfully`,
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
