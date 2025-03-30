
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: string;
  value: number;
  createdAt: string;
  lastContact?: string;
  avatarUrl?: string;
  notes?: string;
  industry?: string;
}
