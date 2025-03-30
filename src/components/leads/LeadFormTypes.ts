
import { Lead } from '@/types/conversation';

export type FormValues = {
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

export interface LeadFormProps {
  lead?: Lead;
  onComplete: () => void;
}
