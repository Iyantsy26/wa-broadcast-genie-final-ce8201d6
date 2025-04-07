
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './LeadFormTypes';

interface LeadDateInfoProps {
  form: UseFormReturn<FormValues>;
  timeOptions: string[];
}

const LeadDateInfo: React.FC<LeadDateInfoProps> = ({ form, timeOptions }) => {
  const [isLastContactOpen, setIsLastContactOpen] = useState(false);
  const [isNextFollowupOpen, setIsNextFollowupOpen] = useState(false);

  return (
    <>
      <FormField
        control={form.control}
        name="last_contact"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Last Contact</FormLabel>
            <Popover open={isLastContactOpen} onOpenChange={setIsLastContactOpen}>
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
                  onSelect={(date) => {
                    field.onChange(date);
                    setIsLastContactOpen(false);
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
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
              <Popover open={isNextFollowupOpen} onOpenChange={setIsNextFollowupOpen}>
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
                        <div className="flex flex-col items-start">
                          <span>{format(field.value, "PPP")}</span>
                          {form.watch("next_followup_time") && (
                            <span className="text-xs text-muted-foreground">
                              {form.watch("next_followup_time")}
                            </span>
                          )}
                        </div>
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
                    onSelect={(date) => {
                      field.onChange(date);
                      setIsNextFollowupOpen(false);
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
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
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      // Make sure we have a date selected
                      const currentDate = form.getValues("next_followup");
                      if (!currentDate) {
                        // If no date is selected, default to today
                        form.setValue("next_followup", new Date());
                      }
                    }}
                  >
                    <option value="">Select time</option>
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
    </>
  );
};

export default LeadDateInfo;
