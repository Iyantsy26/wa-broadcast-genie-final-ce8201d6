
import { v4 as uuidv4 } from 'uuid';
import { Lead } from '@/types/conversation';
import { addDays, subDays, format } from 'date-fns';

export const generateMockLeads = (): Lead[] => {
  const today = new Date();
  
  return [
    {
      id: uuidv4(),
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1 (555) 123-4567',
      company: 'Acme Inc',
      address: '',
      avatar_url: null,
      status: 'New',
      source: 'Website',
      referrer_name: '',
      notes: '',
      created_at: format(subDays(today, 0), 'yyyy-MM-dd'),
      last_contact: format(subDays(today, 0), 'yyyy-MM-dd'),
      next_followup: format(addDays(today, 3), 'yyyy-MM-dd'),
      initials: 'SJ'
    },
    {
      id: uuidv4(),
      name: 'Michael Roberts',
      email: 'michael.roberts@example.com',
      phone: '+1 (555) 234-5678',
      company: 'TechCorp',
      address: '',
      avatar_url: null,
      status: 'Contacted',
      source: 'WhatsApp Campaign',
      referrer_name: '',
      notes: '',
      created_at: format(subDays(today, 3), 'yyyy-MM-dd'),
      last_contact: format(subDays(today, 2), 'yyyy-MM-dd'),
      next_followup: format(addDays(today, 2), 'yyyy-MM-dd'),
      initials: 'MR'
    },
    {
      id: uuidv4(),
      name: 'Jessica Wilson',
      email: 'jessica.wilson@example.com',
      phone: '+1 (555) 345-6789',
      company: 'Wilson & Co',
      address: '',
      avatar_url: null,
      status: 'Qualified',
      source: 'Referral',
      referrer_name: 'David Anderson',
      notes: '',
      created_at: format(subDays(today, 6), 'yyyy-MM-dd'),
      last_contact: format(subDays(today, 3), 'yyyy-MM-dd'),
      next_followup: format(addDays(today, 1), 'yyyy-MM-dd'),
      initials: 'JW'
    },
    {
      id: uuidv4(),
      name: 'David Anderson',
      email: 'david.anderson@example.com',
      phone: '+1 (555) 456-7890',
      company: 'Global Solutions',
      address: '',
      avatar_url: null,
      status: 'Proposal',
      source: 'WhatsApp Bot',
      referrer_name: '',
      notes: '',
      created_at: format(subDays(today, 11), 'yyyy-MM-dd'),
      last_contact: format(subDays(today, 4), 'yyyy-MM-dd'),
      next_followup: format(addDays(today, 5), 'yyyy-MM-dd'),
      initials: 'DA'
    },
    {
      id: uuidv4(),
      name: 'Emily Thompson',
      email: 'emily.thompson@example.com',
      phone: '+1 (555) 567-8901',
      company: 'Creative Design',
      address: '',
      avatar_url: null,
      status: 'Converted',
      source: 'Website',
      referrer_name: '',
      notes: '',
      created_at: format(subDays(today, 16), 'yyyy-MM-dd'),
      last_contact: format(subDays(today, 5), 'yyyy-MM-dd'),
      next_followup: '',
      initials: 'ET'
    },
    {
      id: uuidv4(),
      name: 'James Wilson',
      email: 'james.wilson@example.com',
      phone: '+1 (555) 678-9012',
      company: 'Wilson Enterprises',
      address: '',
      avatar_url: null,
      status: 'Lost',
      source: 'WhatsApp Campaign',
      referrer_name: '',
      notes: '',
      created_at: format(subDays(today, 21), 'yyyy-MM-dd'),
      last_contact: format(subDays(today, 6), 'yyyy-MM-dd'),
      next_followup: '',
      initials: 'JW'
    }
  ];
};
