
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Client } from '@/types/conversation';
import { createClient, updateClient, uploadClientAvatar } from '@/services/clientService';
import { toast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ClientFormProps {
  client?: Client;
  onComplete: () => void;
}

type FormValues = {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  tags?: string;
  join_date?: Date;
  renewal_date?: Date;
  notes?: string;
  plan_details?: string;
  referred_by?: string;
};

const ClientForm: React.FC<ClientFormProps> = ({ client, onComplete }) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(client?.avatar_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: FormValues = {
    name: client?.name || '',
    company: client?.company || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    tags: client?.tags ? client.tags.join(', ') : '',
    join_date: client?.join_date ? new Date(client.join_date) : undefined,
    renewal_date: client?.renewal_date ? new Date(client.renewal_date) : undefined,
    notes: client?.notes || '',
    plan_details: client?.plan_details || '',
    referred_by: client?.referred_by || '',
  };

  const form = useForm<FormValues>({ defaultValues });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "The image must be less than 2MB.",
          variant: "destructive",
        });
        return;
      }
      
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      let avatarUrl = client?.avatar_url;
      
      // If there's a new avatar, upload it
      if (avatarFile) {
        // If we're updating, use the existing ID, otherwise use a temp ID that will be replaced
        const tempId = client?.id || 'temp-' + Date.now();
        avatarUrl = await uploadClientAvatar(avatarFile, tempId);
      }
      
      // Process tags
      const tags = values.tags 
        ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        : undefined;
      
      // Process dates
      const formattedValues = {
        ...values,
        tags,
        join_date: values.join_date ? values.join_date.toISOString() : null,
        renewal_date: values.renewal_date ? values.renewal_date.toISOString() : null,
        avatar_url: avatarUrl
      };
      
      // Create or update the client
      if (client) {
        await updateClient(client.id, formattedValues);
        toast({
          title: "Client updated",
          description: "The client has been successfully updated.",
        });
      } else {
        await createClient(formattedValues);
        toast({
          title: "Client created",
          description: "The client has been successfully created.",
        });
      }
      
      onComplete();
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "Error",
        description: "Failed to save the client.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <div className="flex items-center mb-6">
          <div className="relative mr-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Client avatar preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-4xl">👤</span>
              )}
            </div>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <label 
              htmlFor="avatar" 
              className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer shadow-md"
            >
              +
            </label>
          </div>
          <div>
            <p className="text-sm mb-1">Client Photo</p>
            <p className="text-xs text-gray-500">Max size: 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Name is required" }}
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
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="ACME Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
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
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 123 456 7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, New York, NY" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input placeholder="VIP, Premium, Enterprise (comma separated)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="join_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Join Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="renewal_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Renewal Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="plan_details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan Details</FormLabel>
                <FormControl>
                  <Input placeholder="Premium Plan, Expires 2025-12-31" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="referred_by"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referred By</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information about this client..."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onComplete}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientForm;
