
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface NewContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactCreated: (contact: any) => void;
}

const NewContactDialog: React.FC<NewContactDialogProps> = ({
  open,
  onOpenChange,
  onContactCreated
}) => {
  const [contactType, setContactType] = useState<'client' | 'lead' | 'team'>('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let tableName: 'clients' | 'leads' | 'team_members';
      
      switch (contactType) {
        case 'client':
          tableName = 'clients';
          break;
        case 'lead':
          tableName = 'leads';
          break;
        case 'team':
          tableName = 'team_members';
          break;
      }

      const { data, error } = await supabase
        .from(tableName)
        .insert({
          name,
          email: email || null,
          phone: phone || null,
          company: company || null,
          created_at: new Date().toISOString(),
          status: contactType === 'lead' ? 'new' : contactType === 'team' ? 'active' : null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Contact created',
        description: `${name} has been added as a ${contactType}.`
      });

      // Pass the created contact to the parent component
      onContactCreated(data);
      
      // Reset form and close dialog
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to create contact. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setContactType('client');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="contact-type">Contact type</Label>
            <RadioGroup
              id="contact-type"
              value={contactType}
              onValueChange={(value) => setContactType(value as 'client' | 'lead' | 'team')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="client" id="client" />
                <Label htmlFor="client">Client</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lead" id="lead" />
                <Label htmlFor="lead">Lead</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="team" id="team" />
                <Label htmlFor="team">Team Member</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company/Organization</Label>
            <Input
              id="company"
              placeholder="Company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name}>
              {isSubmitting ? 'Adding...' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewContactDialog;
