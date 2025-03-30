
import React, { useState, useEffect } from 'react';
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
import { Lead } from '@/types/conversation';
import { createLead, updateLead, uploadLeadAvatar } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format, set } from 'date-fns';
import { cn } from '@/lib/utils';

interface LeadFormProps {
  lead?: Lead;
  onComplete: () => void;
}

type FormValues = {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  referrer_name?: string;
  last_contact?: Date;
  next_followup?: Date;
  next_followup_time?: string;
  notes?: string;
};

const LeadForm: React.FC<LeadFormProps> = ({ lead, onComplete }) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(lead?.avatar_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add time options
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeOptions.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  const defaultValues: FormValues = {
    name: lead?.name || '',
    company: lead?.company || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    address: lead?.address || '',
    status: lead?.status || 'New',
    referrer_name: lead?.referrer_name || '',
    last_contact: lead?.last_contact ? new Date(lead.last_contact) : undefined,
    next_followup: lead?.next_followup ? new Date(lead.next_followup) : undefined,
    next_followup_time: lead?.next_followup ? format(new Date(lead.next_followup), 'HH:mm') : '09:00',
    notes: lead?.notes || '',
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
      let avatarUrl = lead?.avatar_url;
      
      // If there's a new avatar, upload it
      if (avatarFile) {
        // If we're updating, use the existing ID, otherwise use a temp ID that will be replaced
        const tempId = lead?.id || 'temp-' + Date.now();
        avatarUrl = await uploadLeadAvatar(avatarFile, tempId);
      }
      
      // Process dates
      let next_followup = values.next_followup;
      
      // If there's a date and time, combine them
      if (next_followup && values.next_followup_time) {
        const [hours, minutes] = values.next_followup_time.split(':').map(Number);
        next_followup = set(next_followup, { hours, minutes });
      }
      
      const formattedValues = {
        name: values.name,
        company: values.company,
        email: values.email,
        phone: values.phone,
        address: values.address,
        status: values.status,
        referrer_name: values.referrer_name,
        last_contact: values.last_contact ? values.last_contact.toISOString() : null,
        next_followup: next_followup ? next_followup.toISOString() : null,
        notes: values.notes,
        avatar_url: avatarUrl
      };
      
      // Create or update the lead
      if (lead) {
        await updateLead(lead.id, formattedValues);
        toast({
          title: "Lead updated",
          description: "The lead has been successfully updated.",
        });
      } else {
        await createLead(formattedValues);
        toast({
          title: "Lead created",
          description: "The lead has been successfully created.",
        });
      }
      
      onComplete();
    } catch (error) {
      console.error("Error saving lead:", error);
      toast({
        title: "Error",
        description: "Failed to save the lead.",
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
                  alt="Lead avatar preview" 
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
            <p className="text-sm mb-1">Lead Photo</p>
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
            name="status"
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select 
                    className="w-full rounded-md border border-input bg-background px-3 py-2" 
                    {...field}
                  >
                    <option value="New">New</option>
                    <option value="Connected">Connected</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Converted">Converted</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="referrer_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referrer Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_contact"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Last Contact</FormLabel>
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

          <div className="space-y-2">
            <FormField
              control={form.control}
              name="next_followup"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Next Follow-up</FormLabel>
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
              name="next_followup_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follow-up Time</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        {...field}
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information about this lead..."
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
            {isSubmitting ? 'Saving...' : lead ? 'Save Changes' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LeadForm;
