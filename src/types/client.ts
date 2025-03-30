
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  value: number;
  clientSince: string;
  avatarUrl?: string;
  status?: string;
  website?: string;
  address?: string;
  notes?: string;
  referredBy?: string;
  tags?: string[];
  subscriptionPlan?: string;
  renewalDate?: string;
}
