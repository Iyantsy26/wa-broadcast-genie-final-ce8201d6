
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
