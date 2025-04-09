
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";
import { importContactsFromTeam } from "@/services/contactService";
import { Contact } from "@/types/conversation";

interface TeamContactImportProps {
  onImportComplete?: (contacts: Contact[]) => void;
}

export function TeamContactImport({ onImportComplete }: TeamContactImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleImport = async () => {
    setIsLoading(true);
    try {
      const contacts = await importContactsFromTeam();
      if (contacts.length > 0 && onImportComplete) {
        onImportComplete(contacts);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error importing team contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          Import Team Contacts
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Team Contacts</DialogTitle>
          <DialogDescription>
            Import all team members from Team Management into your chat contacts.
            This will allow you to start conversations with your team members directly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-2 font-semibold">Team Members</h3>
            <p className="text-sm text-muted-foreground mt-1">
              All team members will be imported as contacts in your Team Chats section
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isLoading}>
            {isLoading ? 'Importing...' : 'Import Team Contacts'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
