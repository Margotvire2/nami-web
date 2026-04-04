/** Messaging domain types — Nami global messaging module */

export type ChannelType = "PUBLIC" | "PRIVATE" | "DM";

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  description?: string;
  tags?: string[];
  memberCount: number;
  unreadCount: number;
  lastMessageAt?: string;
}

export interface DmContact {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  establishment: string;
  isOnline: boolean;
  unreadCount: number;
  lastMessageAt?: string;
}

export interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
    establishment: string;
  };
  replyCount: number;
  isPinned: boolean;
  reactions?: { emoji: string; count: number }[];
}

export interface ChannelDetail {
  id: string;
  name: string;
  type: ChannelType;
  description: string;
  createdAt: string;
  createdBy: string;
  memberCount: number;
  members: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
    establishment: string;
    isOnline: boolean;
  }[];
  pinnedMessages: ChatMessage[];
}
