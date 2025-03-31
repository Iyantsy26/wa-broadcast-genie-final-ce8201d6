
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Lead } from '@/types/conversation';
import { createLead, updateLead, uploadLeadAvatar } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';
import { set } from 'date-fns';

// Import form components
import LeadAvatar from './LeadAvatar';
import LeadContactInfo from './LeadContactInfo';
import LeadStatusInfo from './LeadStatusInfo';
import LeadDateInfo from './LeadDateInfo';
import LeadNotes from './LeadNotes';
import LeadFormActions from './LeadFormActions';
import { FormValues, LeadFormProps } from './LeadFormTypes';

const LeadForm: React.FC<LeadFormProps> = ({ lead, onComplete }) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
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
    source: lead?.source || '',
    referrer_name: lead?.referrer_name || '',
    last_contact: lead?.last_contact ? new Date(lead.last_contact) : undefined,
    next_followup: lead?.next_followup ? new Date(lead.next_followup) : undefined,
    next_followup_time: lead?.next_followup ? new Date(lead.next_followup).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '09:00',
    notes: lead?.notes || '',
  };

  const form = useForm<FormValues>({ defaultValues });

  const handleAvatarChange = (file: File) => {
    setAvatarFile(file);
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
        source: values.source,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[800px] overflow-y-auto">
        <LeadAvatar 
          avatarUrl={lead?.avatar_url || null} 
          onAvatarChange={handleAvatarChange} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LeadContactInfo form={form} />
          <LeadStatusInfo form={form} />
          <LeadDateInfo form={form} timeOptions={timeOptions} />
        </div>

        <LeadNotes form={form} />

        <LeadFormActions 
          isSubmitting={isSubmitting} 
          onCancel={onComplete}
          isEditMode={!!lead}
        />
      </form>
    </Form>
  );
};

export default LeadForm;
