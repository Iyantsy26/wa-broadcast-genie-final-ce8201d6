
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Contact } from '@/types/conversation';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { importContactsFromTeam } from '@/services/contactService';

interface TeamContactImportProps {
  onImportComplete: (contacts: Contact[]) => void;
}

export const TeamContactImport: React.FC<TeamContactImportProps> = ({ onImportComplete }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      
      // Fetch team members from the database
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('status', 'active');
        
      if (error) {
        throw error;
      }
      
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    fetchTeamMembers();
  };

  const toggleMemberSelection = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(memberId => memberId !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      // Convert selected team members to contacts
      const importedContacts: Contact[] = teamMembers
        .filter(member => selectedMembers.includes(member.id))
        .map(member => ({
          id: member.id,
          name: member.name,
          avatar: member.avatar,
          phone: member.phone || '',
          type: 'team',
          isOnline: true,
          lastSeen: new Date().toISOString(),
          tags: []
        }));
      
      // Store contacts in the database using the service
      await importContactsFromTeam();
      
      // Pass the imported contacts back to the parent component
      onImportComplete(importedContacts);
      
      toast({
        title: 'Team contacts imported',
        description: `${importedContacts.length} team contacts imported successfully`,
      });
      setOpen(false);
      setSelectedMembers([]);
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
    <>
      <Button variant="outline" onClick={handleOpen} className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span>Import Team</span>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Team Contacts</DialogTitle>
            <DialogDescription>
              Select team members to import as contacts for conversations
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {loading ? (
              <div className="text-center py-4">Loading team members...</div>
            ) : teamMembers.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {teamMembers.map(member => (
                  <div 
                    key={member.id} 
                    className="flex items-center p-2 rounded hover:bg-slate-100 cursor-pointer"
                    onClick={() => toggleMemberSelection(member.id)}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedMembers.includes(member.id)} 
                      onChange={() => toggleMemberSelection(member.id)}
                      className="mr-3 h-4 w-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.position || member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">No team members found.</div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={selectedMembers.length === 0 || loading}
            >
              Import {selectedMembers.length > 0 ? `(${selectedMembers.length})` : ""}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
