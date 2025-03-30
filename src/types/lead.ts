
/**
 * Lead and related types
 */

export interface LeadActivity {
  id: string;
  type: "note" | "status_change" | "follow_up_scheduled" | string;
  content: string;
  timestamp: string;
  createdBy: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source: "website" | "referral" | "social" | "email" | "event" | "other" | string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed" | "lost" | string;
  nextFollowUp?: string;
  notes?: string;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
  activities?: LeadActivity[];
}
