
export type ChatType = 'team' | 'client' | 'lead';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export type MessageType = 'text' | 'image' | 'video' | 'document' | 'voice' | 'audio';

export type MessageReaction = {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
};

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  role?: string;
  type: ChatType;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOutbound: boolean;
  status?: MessageStatus;
  sender?: string;
  senderId?: string;
  type?: MessageType;
  media?: {
    url: string;
    type: MessageType;
    filename?: string;
    duration?: number;
    size?: number;
  };
  reactions?: MessageReaction[];
  replyTo?: {
    id: string;
    content: string;
    sender: string;
  };
  isForwarded?: boolean;
  viaWhatsApp?: boolean;
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
  assignedTo?: string;
  tags?: string[];
  status: 'new' | 'active' | 'resolved' | 'waiting';
  unreadCount?: number;
  isPinned?: boolean;
  isArchived?: boolean;
  isEncrypted?: boolean;
  chatType: ChatType;
}
