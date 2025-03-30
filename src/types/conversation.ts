export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOutbound: boolean;
  status: 'sent' | 'read' | 'delivered' | 'error';
  sender?: string;
  type: 'text' | 'image' | 'video' | 'document' | 'voice';
  media?: {
    url: string;
    type: 'image' | 'video' | 'document' | 'voice';
    filename?: string;
    duration?: number;
  };
}

export interface Conversation {
  id: string;
  contact: {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
    type: 'client' | 'lead' | 'team';
    isOnline?: boolean;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isOutbound: boolean;
    isRead: boolean;
  };
  status: string;
  chatType: 'team' | 'client' | 'lead';
  isPinned?: boolean;
  isArchived?: boolean;
  unreadCount?: number;
  tags?: string[];
  assignedTo?: string;
}

