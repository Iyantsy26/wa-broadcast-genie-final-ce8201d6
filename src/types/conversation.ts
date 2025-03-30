
export type ChatType = 'team' | 'lead' | 'client';

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  status?: string;
  company?: string;
  isOnline?: boolean;
  lastSeen?: string;
  role?: string;
  type?: string;
}

export interface Conversation {
  id: string;
  contact: Contact;
  lastMessage: {
    content: string;
    timestamp: string;
    isOutbound: boolean;
    isRead: boolean;
  };
  status: string;
  assignedTo?: string;
  tags?: string[];
  type?: ChatType;
  chatType?: ChatType;
  isPinned?: boolean;
  isArchived?: boolean;
  unreadCount?: number;
  isEncrypted?: boolean;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOutbound: boolean;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'sending';
  sender: string;
  senderId?: string;
  type: 'text' | 'image' | 'video' | 'document' | 'voice' | 'location';
  media?: {
    url: string;
    type: 'image' | 'video' | 'document' | 'voice';
    filename?: string;
    duration?: number;
    size?: number;
  };
  reactions?: { emoji: string; count: number }[];
  replyTo?: Message;
  viaWhatsApp?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  source?: string;
  referrer_name?: string;
  created_at: string;
  last_contact?: string;
  next_followup?: string;
  notes?: string;
  avatar_url?: string;
  initials?: string;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  tags?: string[];
  join_date?: string;
  renewal_date?: string;
  notes?: string;
  plan_details?: string;
  referred_by?: string;
  avatar_url?: string;
}
