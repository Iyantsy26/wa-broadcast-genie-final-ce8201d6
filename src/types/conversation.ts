
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

export interface Reaction {
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
  reactions?: Reaction[];
  viaWhatsApp?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  type: ChatType;
  isOnline?: boolean;
  lastSeen?: string;
  role?: string;
  isStarred?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  isBlocked?: boolean;
  tags: string[];
}

export interface ConversationSettings {
  notifications: boolean;
  showTypingIndicator: boolean;
  messageDisappearing: boolean;
  disappearingTimeout: number;
  mediaAutoDownload: boolean;
  chatBackup: boolean;
  language: string;
  fontSize: 'small' | 'medium' | 'large';
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
  tags?: string[];
  assignedTo?: string;
  isEncrypted?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  unreadCount?: number;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  avatar_url?: string;
  address?: string;
  tags?: string[];
  notes?: string;
  plan_details?: string;
  join_date: string;
  renewal_date?: string;
  referred_by?: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  avatar_url?: string;
  address?: string;
  status: string;
  source?: string;
  notes?: string;
  created_at: string;
  last_contact?: string;
  next_followup?: string;
  referrer_name?: string;
}

// Import DateRange from react-day-picker to use in our components
import { DateRange as DayPickerDateRange } from 'react-day-picker';
export type DateRange = DayPickerDateRange;

// Define types for Canned Replies
export interface CannedReply {
  id: string;
  title: string;
  content: string;
}
