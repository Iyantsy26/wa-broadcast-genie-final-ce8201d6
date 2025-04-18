
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './LeadFormTypes';

interface LeadContactInfoProps {
  form: UseFormReturn<FormValues>;
}

const LeadContactInfo: React.FC<LeadContactInfoProps> = ({ form }) => {
  return (
    <>
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
              <Input placeholder="Acme Inc" {...field} />
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
              <Input placeholder="john@example.com" type="email" {...field} />
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
              <div className="flex">
                <select 
                  className="w-24 rounded-l-md border border-input bg-background px-2 py-2 border-r-0"
                  defaultValue="+1"
                  onChange={(e) => {
                    const countryCode = e.target.value;
                    const phoneNumber = field.value?.replace(/^\+\d+\s/, '') || '';
                    field.onChange(`${countryCode} ${phoneNumber}`);
                  }}
                >
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+91">+91 (IN)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+86">+86 (CN)</option>
                  <option value="+52">+52 (MX)</option>
                  <option value="+971">+971 (UAE)</option>
                  <option value="+65">+65 (SG)</option>
                </select>
                <Input 
                  placeholder="(555) 123-4567" 
                  className="rounded-l-none"
                  value={field.value?.replace(/^\+\d+\s/, '') || ''}
                  onChange={(e) => {
                    const countryCode = field.value?.match(/^\+\d+/)?.[0] || '+1';
                    field.onChange(`${countryCode} ${e.target.value}`);
                  }}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="source"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Source</FormLabel>
            <FormControl>
              <select 
                className="w-full rounded-md border border-input bg-background px-3 py-2" 
                {...field}
                value={field.value || ""}
              >
                <option value="">-- Select Source --</option>
                <option value="Website">Website</option>
                <option value="WhatsApp Campaign">WhatsApp Campaign</option>
                <option value="WhatsApp Bot">WhatsApp Bot</option>
                <option value="Referral">Referral</option>
                <option value="Email Campaign">Email Campaign</option>
                <option value="Social Media">Social Media</option>
                <option value="Other">Other</option>
              </select>
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
              <Input placeholder="123 Main St, City, Country" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default LeadContactInfo;
