
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "./ProfileFormTypes";
import { User } from "lucide-react";

interface PersonalInfoFormProps {
  form: UseFormReturn<ProfileFormValues>;
  isSuperAdmin: boolean;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ form, isSuperAdmin }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="customId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>User ID</FormLabel>
            <FormControl>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="System assigned ID" 
                  {...field} 
                  className="pl-8 bg-muted"
                  readOnly
                  disabled
                />
              </div>
            </FormControl>
            <FormDescription className="text-xs">
              This is your unique system ID and cannot be changed.
            </FormDescription>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Your name" {...field} />
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
              <Input 
                type="email" 
                placeholder="your.email@example.com" 
                {...field} 
                disabled={!isSuperAdmin} 
              />
            </FormControl>
            {isSuperAdmin && (
              <p className="text-xs text-muted-foreground">
                As a Super Admin, you can edit your email address.
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input placeholder="Your company" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input placeholder="Your address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default PersonalInfoForm;
