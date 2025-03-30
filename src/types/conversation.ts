
export type MessageStatus = 'sent' | 'read' | 'delivered' | 'error' | 'sending';
export type MessageType = 'text' | 'image' | 'video' | 'document' | 'voice';
export type ChatType = 'team' | 'client' | 'lead';

export interface ReplyTo {
  id: string;
  content: string;
  sender: string;
  type: MessageType;
  status: MessageStatus;
  isOutbound: boolean;
  timestamp: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOutbound: boolean;
  status: MessageStatus;
  sender?: string;
  type: MessageType;
  media?: {
    url: string;
    type: 'image' | 'video' | 'document' | 'voice';
    filename?: string;
    duration?: number;
    size?: number;
  };
  replyTo?: ReplyTo;
  reactions?: MessageReaction[];
  viaWhatsApp?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  type: 'client' | 'lead' | 'team';
  isOnline?: boolean;
  lastSeen?: string;
  role?: string;
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
  chatType: ChatType;
  isPinned?: boolean;
  isArchived?: boolean;
  unreadCount?: number;
  tags?: string[];
  assignedTo?: string;
  isEncrypted?: boolean;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  avatar_url?: string;
  join_date?: string;
  renewal_date?: string;
  plan_details?: string;
  referred_by?: string;
  notes?: string;
  tags?: string[];
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  avatar_url?: string;
  status?: string;
  source?: string;
  referrer_name?: string;
  notes?: string;
  last_contact?: string;
  next_followup?: string;
  created_at?: string;
  initials?: string;
}
