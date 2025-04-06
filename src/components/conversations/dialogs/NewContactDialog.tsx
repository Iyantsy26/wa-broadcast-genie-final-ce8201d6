
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChatType } from '@/types/conversation';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  phone: z.string().min(6, {
    message: 'Phone number must be at least 6 characters.',
  }),
  type: z.enum(['client', 'lead', 'team'], {
    required_error: 'Please select a contact type.',
  }),
});

export interface NewContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactCreated: (contact: any) => void;
}

const NewContactDialog: React.FC<NewContactDialogProps> = ({
  open,
  onOpenChange,
  onContactCreated
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      type: 'lead' as ChatType,
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Here you would normally call an API to create a contact
      // For now, we'll just simulate a successful creation
      
      // Create a new contact object
      const newContact = {
        id: `new-${Date.now()}`,
        name: values.name,
        phone: values.phone,
        type: values.type as ChatType,
        // Add any other required fields with default values
        tags: [],
        isOnline: false,
        lastSeen: new Date().toISOString(),
      };
      
      // Call the callback with the new contact
      onContactCreated(newContact);
      
      toast({
        title: "Success",
        description: `${values.type === 'lead' ? 'Lead' : values.type === 'client' ? 'Client' : 'Team member'} ${values.name} was added successfully.`,
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating contact:", error);
      toast({
        title: "Error",
        description: "Failed to create contact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Create a new contact to start a conversation.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a contact type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="team">Team Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This determines how the contact will be categorized.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Contact'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewContactDialog;
