
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './LeadFormTypes';

interface LeadStatusInfoProps {
  form: UseFormReturn<FormValues>;
}

const LeadStatusInfo: React.FC<LeadStatusInfoProps> = ({ form }) => {
  return (
    <>
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
    </>
  );
};

export default LeadStatusInfo;
