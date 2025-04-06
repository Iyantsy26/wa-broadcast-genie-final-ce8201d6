
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChatType } from '@/types/conversation';
import { Plus } from "lucide-react";

interface AddContactButtonProps {
  onAddContact: (name: string, phone: string, type: ChatType) => void;
}

const AddContactButton: React.FC<AddContactButtonProps> = ({ onAddContact }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<ChatType>('lead');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddContact(name, phone, type);
    setOpen(false);
    resetForm();
  };
  
  const resetForm = () => {
    setName('');
    setPhone('');
    setType('lead');
  };
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Contact
      </Button>
      
      <Dialog open={open} onOpenChange={(value) => {
        setOpen(value);
        if (!value) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Create a new contact to start a conversation
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contact name"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Contact Type</Label>
                <RadioGroup value={type} onValueChange={(value) => setType(value as ChatType)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lead" id="lead" />
                    <Label htmlFor="lead" className="cursor-pointer">Lead</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="client" id="client" />
                    <Label htmlFor="client" className="cursor-pointer">Client</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="team" id="team" />
                    <Label htmlFor="team" className="cursor-pointer">Team Member</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Contact</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddContactButton;
